import express from 'express';
import Game from '../models/Game.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/games/upcoming
router.get('/upcoming', async (req, res) => {
  try {
    const games = await Game.find({ status: 'upcoming' })
      .select('-questions.ans -participants')
      .sort({ scheduledAt: 1 })
      .limit(20);
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/games/live
router.get('/live', async (req, res) => {
  try {
    const games = await Game.find({ status: 'live' })
      .select('-questions.ans')
      .limit(5);
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/games/join
router.post('/join', protect, async (req, res) => {
  try {
    const { gameId } = req.body;
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    if (game.status === 'ended') return res.status(400).json({ success: false, message: 'Game has ended' });

    const user = await User.findById(req.user._id);
    if (user.balance < game.entryFee)
      return res.status(400).json({ success: false, message: 'Insufficient balance' });

    // Check already joined
    const alreadyJoined = game.participants.find(p => p.userId?.toString() === user._id.toString());
    if (alreadyJoined)
      return res.status(409).json({ success: false, message: 'Already joined this game' });

    // Deduct entry fee
    user.balance -= game.entryFee;
    user.stats.gamesPlayed += 1;
    await user.save();

    await Transaction.create({ userId: user._id, type: 'entry', label: `Show Entry – ${game.title}`, amount: -game.entryFee, gameId: game._id });

    game.participants.push({ userId: user._id, name: user.name });
    await game.save();

    res.json({ success: true, message: 'Joined game', balance: user.balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/games/history
router.get('/history', protect, async (req, res) => {
  try {
    const games = await Game.find({
      'participants.userId': req.user._id,
      status: 'ended',
    })
      .select('title category prizePool scheduledAt participants.$')
      .sort({ endedAt: -1 })
      .limit(20);
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
