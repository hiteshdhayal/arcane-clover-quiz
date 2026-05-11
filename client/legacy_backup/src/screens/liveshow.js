import { state, questions } from '../state.js';
import { navigate, toast, confetti, timerRing, formatBalance, showModal } from '../utils.js';
import { renderHome } from './home.js';

let questionTimer = null;
let currentShow = null;
let questionIndex = 0;
let eliminated = false;
let currentStreak = 0;
let multiplier = 1.0;
let selectedAnswer = null;
let playersLeft = 0;
let totalPlayers = 0;
let prizePot = 0;

export function startLiveShow(show) {
  currentShow = show;
  questionIndex = 0;
  eliminated = false;
  currentStreak = 0;
  multiplier = 1.0;
  selectedAnswer = null;
  playersLeft = show.players;
  totalPlayers = show.players;
  prizePot = parseFloat(show.prize.replace('$',''));

  navigate('live');
  toast(`🎯 Entering ${show.title}...`, '⚡');
  setTimeout(() => showQuestion(), 800);
}

function getQBank() {
  if (!currentShow) return questions.general;
  const map = { general: questions.general, pop: questions.pop, sports: questions.general };
  return map[currentShow.category] || questions.general;
}

function showQuestion() {
  if (eliminated) return;
  const el = document.getElementById('screen-live');
  const bank = getQBank();
  const q = bank[questionIndex % bank.length];
  let timeLeft = 10;

  el.innerHTML = `
    <div style="background:var(--bg);min-height:100vh;display:flex;flex-direction:column;">
      <div style="padding:16px;display:flex;justify-content:space-between;align-items:center;">
        <button class="btn btn-ghost btn-sm" id="quit-show">✕ Quit</button>
        <div class="streak-display">
          ${currentStreak >= 3 ? `<span class="streak-fire">🔥</span>` : ''}
          <span style="font-size:14px;color:#94a3b8">${currentStreak > 0 ? currentStreak + ' streak' : ''}</span>
          ${multiplier > 1 ? `<span class="badge badge-yellow">${multiplier}×</span>` : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#64748b">PLAYERS LEFT</div>
          <div style="font-weight:800;color:#ef4444" id="players-count">${Math.floor(playersLeft).toLocaleString()}</div>
        </div>
      </div>

      <div style="height:6px;background:var(--surface2)">
        <div style="height:100%;background:var(--grad);width:${((questionIndex)/12)*100}%;transition:width .5s"></div>
      </div>

      <div style="text-align:center;padding:10px 16px 6px;">
        <div style="font-size:13px;color:#94a3b8">QUESTION ${questionIndex + 1} OF 12</div>
      </div>

      <div style="display:flex;justify-content:center;align-items:center;padding:12px;">
        <div class="timer-ring" id="timer-ring"></div>
      </div>

      <div style="margin:0 16px 16px;background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:24px;">
        <div style="font-size:11px;color:#a855f7;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">
          ${(currentShow?.category || 'general').toUpperCase()} · ${currentShow?.prize || '$500'} PRIZE POOL
        </div>
        <div class="question-text">${q.q}</div>
        <div class="answer-grid" id="answer-grid">
          ${q.opts.map((opt, i) => `
            <button class="answer-btn" data-idx="${i}" id="ans-${i}">
              <span style="font-size:11px;font-weight:800;margin-right:4px;opacity:.5">${['A','B','C','D'][i]}</span>
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="padding:0 16px;text-align:center;">
        <div style="display:flex;justify-content:center;gap:12px;">
          ${state.user.powerups.timeShield > 0 ? `<button class="btn btn-secondary btn-sm" id="use-shield">⏱ +3s Shield</button>` : ''}
          ${state.user.powerups.questionPeek > 0 ? `<button class="btn btn-secondary btn-sm" id="use-peek">👁 Peek</button>` : ''}
        </div>
      </div>
    </div>
  `;

  // Render timer
  const ringEl = el.querySelector('#timer-ring');
  const updateRing = () => timerRing(ringEl, timeLeft, 10);
  updateRing();

  // Start countdown
  clearInterval(questionTimer);
  questionTimer = setInterval(() => {
    timeLeft--;
    if (el.querySelector('#timer-ring')) timerRing(el.querySelector('#timer-ring'), timeLeft, 10);
    if (timeLeft <= 0) {
      clearInterval(questionTimer);
      if (selectedAnswer === null) handleAnswer(null, q.ans);
    }
  }, 1000);

  // Answer buttons
  el.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (selectedAnswer !== null) return;
      selectedAnswer = parseInt(btn.dataset.idx);
      el.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
      btn.classList.add('selected');
      clearInterval(questionTimer);
      // small delay for feel
      setTimeout(() => handleAnswer(selectedAnswer, q.ans), 400);
    });
  });

  // Power-ups
  el.querySelector('#use-shield')?.addEventListener('click', () => {
    if (state.user.powerups.timeShield > 0) {
      state.user.powerups.timeShield--;
      timeLeft = Math.min(10, timeLeft + 3);
      timerRing(el.querySelector('#timer-ring'), timeLeft, 10);
      toast('⏱ Time Shield activated! +3 seconds', '⚡');
    }
  });
  el.querySelector('#use-peek')?.addEventListener('click', () => {
    if (state.user.powerups.questionPeek > 0) {
      state.user.powerups.questionPeek--;
      toast(`👁 Next question is about: ${(currentShow?.category || 'General').toUpperCase()}`, '💡', 3000);
    }
  });
  el.querySelector('#quit-show').addEventListener('click', () => {
    clearInterval(questionTimer);
    if (confirm('Quit this show?')) {
      navigate('home');
      renderHome();
    }
  });

  selectedAnswer = null;
}

function handleAnswer(chosen, correctIdx) {
  const el = document.getElementById('screen-live');
  const correct = chosen === correctIdx;
  clearInterval(questionTimer);

  // Show result styling
  el.querySelectorAll('.answer-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) btn.classList.add('correct');
    else if (i === chosen && !correct) btn.classList.add('wrong');
  });

  if (correct) {
    currentStreak++;
    if (currentStreak >= 12) multiplier = 2.0;
    else if (currentStreak >= 8) multiplier = 1.5;
    else if (currentStreak >= 5) multiplier = 1.25;
    // drop some players
    const dropRate = 0.15 + Math.random() * 0.2;
    playersLeft = Math.max(1, Math.floor(playersLeft * (1 - dropRate)));
    toast(`✅ Correct! ${currentStreak >= 5 ? '🔥 ' + multiplier + '× Multiplier!' : ''}`, '✅');
  } else {
    currentStreak = 0;
    multiplier = 1.0;
    toast('❌ Wrong answer!', '❌');
    setTimeout(() => showElimination(), 1200);
    return;
  }

  questionIndex++;
  if (questionIndex >= 12) {
    setTimeout(() => showWinner(), 1500);
  } else {
    setTimeout(() => { selectedAnswer = null; showQuestion(); }, 2500);
  }
}

function showElimination() {
  eliminated = true;
  const el = document.getElementById('screen-live');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;background:var(--bg);">
      <div style="font-size:72px;margin-bottom:16px;">😤</div>
      <h2 style="font-size:32px;font-weight:900;margin-bottom:8px;">Eliminated</h2>
      <p style="color:#94a3b8;margin-bottom:8px;">You answered ${questionIndex} of 12 correctly</p>
      <p style="color:#64748b;font-size:14px;margin-bottom:32px;">Better luck next time! Practice with the daily challenge.</p>

      <div style="background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(6,182,212,.1));border:1.5px solid rgba(124,58,237,.4);border-radius:24px;padding:24px;width:100%;max-width:360px;margin-bottom:24px;">
        <div class="badge badge-live" style="margin-bottom:12px;">⚡ SECOND CHANCE</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:8px;">Fastest Finger!</div>
        <div style="font-size:14px;color:#94a3b8;margin-bottom:16px;line-height:1.6">Tap the button as fast as possible to enter the <strong style="color:#10b981">$20 consolation pool</strong>!</div>
        <div id="second-chance-timer" style="font-size:36px;font-weight:900;font-family:'JetBrains Mono',monospace;color:#f59e0b;margin-bottom:16px;">30</div>
        <button class="btn btn-primary btn-full btn-lg" id="second-chance-btn">👆 TAP NOW!</button>
      </div>

      <button class="btn btn-ghost btn-full" id="back-home-elim">← Back to Home</button>
    </div>
  `;

  let scTime = 30;
  let tapped = false;
  const scTimer = setInterval(() => {
    scTime--;
    const timerEl = el.querySelector('#second-chance-timer');
    if (timerEl) timerEl.textContent = scTime;
    if (timerEl) timerEl.style.color = scTime <= 10 ? '#ef4444' : '#f59e0b';
    if (scTime <= 0) { clearInterval(scTimer); }
  }, 1000);

  el.querySelector('#second-chance-btn').addEventListener('click', () => {
    if (tapped || scTime <= 0) return;
    tapped = true;
    clearInterval(scTimer);
    const btn = el.querySelector('#second-chance-btn');
    btn.disabled = true;
    btn.textContent = '✅ Registered!';
    toast('⚡ You\'re in the consolation pool!', '🎉', 3000);
    setTimeout(() => showConsolationResult(), 3000);
  });

  el.querySelector('#back-home-elim').addEventListener('click', () => {
    clearInterval(scTimer);
    clearInterval(questionTimer);
    navigate('home');
    renderHome();
  });
}

function showConsolationResult() {
  const won = Math.random() > 0.6;
  const amount = (Math.random() * 4 + 1).toFixed(2);
  const el = document.getElementById('screen-live');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;background:var(--bg);">
      <div style="font-size:72px;margin-bottom:16px;">${won ? '🎊' : '😔'}</div>
      <h2 style="font-size:28px;font-weight:900;margin-bottom:8px;">${won ? 'Consolation Prize!' : 'So Close!'}</h2>
      ${won ? `
        <div style="font-size:52px;font-weight:900;font-family:'JetBrains Mono',monospace;" class="grad-text">+$${amount}</div>
        <p style="color:#94a3b8;margin-top:8px;margin-bottom:24px;">Added to your balance!</p>
      ` : `
        <p style="color:#94a3b8;margin-bottom:24px;">The consolation pool went to faster players. Try again tomorrow!</p>
      `}
      <button class="btn btn-primary btn-full" style="max-width:280px;" id="elim-home">Back to Home</button>
    </div>
  `;
  if (won) { state.user.balance += parseFloat(amount); confetti(); }
  el.querySelector('#elim-home').addEventListener('click', () => { navigate('home'); renderHome(); });
}

function showWinner() {
  const prize = (prizePot / Math.max(1, playersLeft) * multiplier).toFixed(2);
  const won = parseFloat(prize);
  state.user.balance += won;
  state.user.totalWon += won;
  confetti();
  const el = document.getElementById('screen-live');
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;background:var(--bg);">
      <div class="orb orb-purple" style="top:20%;left:10%;opacity:.2"></div>
      <div class="orb orb-pink" style="bottom:20%;right:10%;opacity:.15"></div>
      <div style="font-size:80px;margin-bottom:16px;animation:shake .5s ease infinite alternate;">🏆</div>
      <h1 style="font-size:40px;font-weight:900;margin-bottom:4px;" class="grad-text">You Won!</h1>
      <p style="color:#94a3b8;margin-bottom:8px;">12/12 correct ${multiplier > 1 ? `· ${multiplier}× multiplier applied` : ''}</p>
      <div style="font-size:64px;font-weight:900;font-family:'JetBrains Mono',monospace;margin:16px 0;" class="grad-text">+$${prize}</div>
      <div style="font-size:14px;color:#10b981;margin-bottom:32px;">Added to your balance instantly ⚡</div>
      <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px;">
        <button class="btn btn-primary btn-full btn-lg" id="winner-share">📲 Share Your Win</button>
        <button class="btn btn-secondary btn-full" id="winner-home">Back to Home</button>
      </div>
    </div>
  `;
  el.querySelector('#winner-share').addEventListener('click', () => toast('🔗 Win shared!', '📲'));
  el.querySelector('#winner-home').addEventListener('click', () => { navigate('home'); renderHome(); });
}
