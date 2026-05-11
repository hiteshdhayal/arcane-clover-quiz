import Game from '../models/Game.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { io } from '../index.js';

// In-memory game state (also cached in Redis when available)
const activeGames = new Map(); // gameId → { timer, questionIndex, players }

export function registerGameHandlers(io, socket, redis) {

  // ── game:join ──────────────────────────────────────────────────────────────
  socket.on('game:join', async ({ gameId, userId }) => {
    try {
      socket.join(`game:${gameId}`);
      socket.gameId = gameId;
      socket.userId = userId;

      // Track player in room
      let gameState = activeGames.get(gameId) || { players: new Set(), questionIndex: 0 };
      gameState.players.add(userId);
      activeGames.set(gameId, gameState);

      const playerCount = gameState.players.size;
      io.to(`game:${gameId}`).emit('game:player_count', { count: playerCount });

      // If Redis available, persist player list
      if (redis) await redis.sAdd(`game:${gameId}:players`, userId).catch(() => {});

      socket.emit('game:joined', { gameId, message: 'Joined game successfully' });
      console.log(`[Game] Player ${userId} joined game ${gameId}`);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // ── game:answer ────────────────────────────────────────────────────────────
  socket.on('game:answer', async ({ gameId, questionIndex, answerIndex, responseTime, userId }) => {
    try {
      const game = await Game.findById(gameId);
      if (!game || game.status !== 'live') return;

      const question = game.questions[questionIndex];
      if (!question) return;

      const isCorrect = question.ans === answerIndex;
      const participant = game.participants.find(p => p.userId?.toString() === userId);

      if (participant) {
        participant.answers.push({ question: questionIndex, answer: answerIndex, correct: isCorrect, responseTime });

        if (isCorrect) {
          participant.streak += 1;
          if (participant.streak >= 5) participant.multiplier = 1.25;
          const points = Math.round((10 - responseTime) * 100 * participant.multiplier);
          participant.score += points;
        } else {
          participant.streak = 0;
          participant.multiplier = 1.0;
          participant.eliminated = true;
        }

        await game.save();

        // Emit result back to the answering player
        socket.emit('game:answer_result', {
          correct: isCorrect,
          correctIndex: question.ans,
          score: participant.score,
          streak: participant.streak,
          multiplier: participant.multiplier,
        });

        // Broadcast updated leaderboard
        const leaderboard = buildLeaderboard(game.participants);
        io.to(`game:${gameId}`).emit('game:leaderboard', { leaderboard });
      }
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // ── game:leave ─────────────────────────────────────────────────────────────
  socket.on('game:leave', ({ gameId, userId }) => {
    socket.leave(`game:${gameId}`);
    const gameState = activeGames.get(gameId);
    if (gameState) {
      gameState.players.delete(userId);
      io.to(`game:${gameId}`).emit('game:player_count', { count: gameState.players.size });
    }
  });

  // ── Admin: start game (in production this would be from a secure admin channel)
  socket.on('admin:start_game', async ({ gameId }) => {
    try {
      const game = await Game.findById(gameId);
      if (!game || game.status !== 'upcoming') return;

      game.status = 'live';
      game.startedAt = new Date();
      await game.save();

      io.to(`game:${gameId}`).emit('game:start', {
        gameId,
        title: game.title,
        totalQuestions: game.questions.length,
        prizePool: game.prizePool,
      });

      // Start broadcasting questions
      broadcastQuestions(io, game, redis);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
}

// ── Question broadcaster ───────────────────────────────────────────────────
async function broadcastQuestions(io, game, redis) {
  const questions = game.questions;
  for (let i = 0; i < questions.length; i++) {
    // Wait 2s before first question, 3s between subsequent
    await sleep(i === 0 ? 2000 : 3000);

    const q = questions[i];
    io.to(`game:${game._id}`).emit('game:question', {
      index: i,
      total: questions.length,
      question: q.q,
      options: q.opts,
      timeLimit: q.timeLimit || 10,
    });

    // Cache current question in Redis
    if (redis) await redis.set(`game:${game._id}:q`, i).catch(() => {});

    // Wait for time limit
    await sleep((q.timeLimit || 10) * 1000);
  }

  // Game ended
  await endGame(io, game);
}

async function endGame(io, game) {
  try {
    const freshGame = await Game.findById(game._id);
    freshGame.status = 'ended';
    freshGame.endedAt = new Date();

    const leaderboard = buildLeaderboard(freshGame.participants);
    await distributePrizes(freshGame, leaderboard);
    await freshGame.save();

    io.to(`game:${freshGame._id}`).emit('game:end', {
      leaderboard: leaderboard.slice(0, 10),
      message: 'Game over! Prizes distributed.',
    });
  } catch (err) {
    console.error('[Game] Error ending game:', err.message);
  }
}

async function distributePrizes(game, leaderboard) {
  const pool = game.prizePool;
  const prizeMap = [0.40, 0.20, 0.10]; // 1st, 2nd, 3rd

  for (let i = 0; i < Math.min(3, leaderboard.length); i++) {
    const winner = leaderboard[i];
    const prize = +(pool * prizeMap[i]).toFixed(2);
    if (!winner.userId) continue;

    const user = await User.findById(winner.userId);
    if (user) {
      user.balance += prize;
      user.stats.totalWon += prize;
      await user.save();
      await Transaction.create({ userId: user._id, type: 'win', label: `Won: ${game.title}`, amount: prize, gameId: game._id });

      // Notify the winner's socket
      io.to(`user:${winner.userId}`).emit('user:balance_update', { balance: user.balance });
      io.to(`user:${winner.userId}`).emit('payment:confirmed', { amount: prize, label: `🏆 Prize: ${game.title}` });
    }
  }
}

function buildLeaderboard(participants) {
  return [...participants]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ rank: i + 1, userId: p.userId, name: p.name, score: p.score, streak: p.streak, eliminated: p.eliminated }));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
