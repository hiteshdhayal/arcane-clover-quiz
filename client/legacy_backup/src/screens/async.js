import { state, questions } from '../state.js';
import { navigate, toast, formatCountdown } from '../utils.js';
import { renderHome } from './home.js';

let asyncTimer = null;
let qIdx = 0;
let answers = [];

export function renderAsync() {
  const el = document.getElementById('screen-async');
  if (state.asyncChallenge.complete) {
    showAsyncResults();
    return;
  }
  if (state.asyncChallenge.question === 0) {
    showAsyncIntro();
  } else {
    showAsyncQuestion();
  }
}

function showAsyncIntro() {
  const el = document.getElementById('screen-async');
  qIdx = 0;
  answers = [];
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;background:var(--bg);">
      <div class="page-header">
        <button class="btn btn-ghost btn-sm" onclick="window.navigate && window.navigate('home')">← Back</button>
        <div style="font-weight:800">Daily Challenge</div>
        <div></div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center">
        <div class="orb orb-purple" style="top:10%;left:10%;opacity:.15"></div>
        <div style="font-size:64px;margin-bottom:16px;">📝</div>
        <h1 style="font-size:32px;font-weight:900;margin-bottom:8px;">Daily Challenge</h1>
        <p style="color:#94a3b8;line-height:1.6;max-width:300px;margin-bottom:8px;">10 questions. No timer pressure. Just answer carefully and score as high as you can.</p>
        <div style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);border-radius:14px;padding:12px 20px;margin-bottom:8px;">
          <span style="color:#10b981;font-weight:700">Prize: $150</span> · Top 10% of scores wins
        </div>
        <div style="font-size:13px;color:#64748b;margin-bottom:32px;">⏰ Available for ${formatCountdown(state.asyncChallenge.timeLeft)}</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:32px;">One attempt per day — make it count!</div>
        <button class="btn btn-primary btn-lg" id="start-async-game">Start Challenge →</button>
      </div>
    </div>
  `;
  el.querySelector('#start-async-game').addEventListener('click', () => {
    qIdx = 0; answers = [];
    state.asyncChallenge.question = 1;
    showAsyncQuestion();
  });
  el.querySelector('button[onclick]').addEventListener('click', () => navigate('home'));
}

function showAsyncQuestion() {
  const el = document.getElementById('screen-async');
  const q = questions.async[qIdx];
  const pct = (qIdx / 10) * 100;

  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;background:var(--bg);">
      <div style="padding:16px 16px 8px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:13px;color:#94a3b8">DAILY CHALLENGE</div>
        <div class="badge badge-green">📝 ${qIdx + 1}/10</div>
      </div>
      <div style="height:6px;background:var(--surface2);margin:0 16px;">
        <div style="height:100%;background:linear-gradient(90deg,#10b981,#06b6d4);width:${pct}%;border-radius:99px;transition:width .5s"></div>
      </div>
      <div style="flex:1;padding:20px 16px;">
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:24px;margin-bottom:16px;">
          <div style="font-size:11px;color:#06b6d4;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">Question ${qIdx + 1}</div>
          <div style="font-size:20px;font-weight:700;line-height:1.4;margin-bottom:24px;">${q.q}</div>
          <div class="answer-grid" id="async-answers">
            ${q.opts.map((opt, i) => `
              <button class="answer-btn" data-idx="${i}">
                <span style="font-size:11px;font-weight:800;margin-right:4px;opacity:.5">${['A','B','C','D'][i]}</span>${opt}
              </button>
            `).join('')}
          </div>
        </div>
        <div style="text-align:center;color:#64748b;font-size:13px;">Take your time — no countdown here 🧘</div>
      </div>
    </div>
  `;

  el.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = parseInt(btn.dataset.idx);
      const correct = chosen === q.ans;
      el.querySelectorAll('.answer-btn').forEach((b, i) => {
        b.disabled = true;
        if (i === q.ans) b.classList.add('correct');
        else if (i === chosen && !correct) b.classList.add('wrong');
      });
      answers.push(correct);
      setTimeout(() => {
        qIdx++;
        state.asyncChallenge.question = qIdx;
        if (qIdx >= 10) {
          const score = answers.filter(Boolean).length;
          state.asyncChallenge.score = score;
          state.asyncChallenge.complete = true;
          showAsyncResults();
        } else {
          showAsyncQuestion();
        }
      }, 1800);
    });
  });
}

function showAsyncResults() {
  const el = document.getElementById('screen-async');
  const score = state.asyncChallenge.score;
  const pct = Math.round((score / 10) * 100);
  const winner = pct >= 80;

  el.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;background:var(--bg);">
      <div style="font-size:72px;margin-bottom:16px;">${score >= 8 ? '🌟' : score >= 6 ? '👍' : '📚'}</div>
      <h1 style="font-size:36px;font-weight:900;margin-bottom:8px;">Challenge Complete!</h1>
      <div style="font-size:64px;font-weight:900;font-family:'JetBrains Mono',monospace;margin:12px 0;" class="${winner ? 'grad-text' : ''}">${score}/10</div>
      <div style="color:#94a3b8;margin-bottom:24px;">Top ${100-pct}% of players today</div>
      ${winner ? `
        <div style="background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.4);border-radius:16px;padding:16px 24px;margin-bottom:24px;">
          <div style="font-size:14px;color:#10b981;font-weight:700;">🎉 You're in the prize pool!</div>
          <div style="font-size:13px;color:#94a3b8;margin-top:4px;">Results announced at midnight</div>
        </div>
      ` : `
        <div style="background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:16px;padding:16px 24px;margin-bottom:24px;">
          <div style="font-size:14px;color:#94a3b8">Score 8+ to enter the prize pool</div>
          <div style="font-size:13px;color:#64748b;margin-top:4px;">Try again tomorrow!</div>
        </div>
      `}
      <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:280px;">
        <button class="btn btn-primary btn-full" id="async-back">Back to Home</button>
      </div>
    </div>
  `;
  el.querySelector('#async-back').addEventListener('click', () => { navigate('home'); renderHome(); });
}
