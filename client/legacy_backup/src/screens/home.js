import { state } from '../state.js';
import { navigate, toast, formatBalance, formatCountdown, showModal } from '../utils.js';
import { startLiveShow } from './liveshow.js';

let countdownInterval = null;

export function renderHome() {
  const el = document.getElementById('screen-home');
  const liveShow = state.shows.find(s => s.live);
  const upcoming = state.shows.filter(s => !s.live);
  const asyncLeft = formatCountdown(state.asyncChallenge.timeLeft);
  const cats = ['All','General','Pop Culture','Sports','Finance'];

  el.innerHTML = `
    <div class="glass-header-pill">
      <div class="header-logo" style="font-size: 18px;">
        <img src="/logo.png" alt="Pulse" style="width: 24px; height: 24px;" />
        <span class="grad-text">Pulse</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <div class="balance-pill" id="home-balance-pill" style="padding: 4px 10px; font-size: 13px;">
          <span id="home-balance">${formatBalance(state.user.balance)}</span>
        </div>
        <div style="position:relative;cursor:pointer" id="notif-btn">
          <svg width="20" height="20" fill="none" stroke="var(--text-primary)" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <div class="notif-dot" style="position:absolute;top:-2px;right:-2px"></div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="section" style="padding-bottom:0">
        <div class="glass-panel" style="position:relative;overflow:hidden;text-align:center;padding:32px 20px;">
          <div class="badge badge-live" style="position:absolute;top:16px;left:16px;">LIVE NOW</div>
          <div style="font-size:42px;font-weight:700;font-family:var(--font-serif);color:var(--bg-primary);" class="mt-8">$250</div>
          <div style="font-size:22px;font-weight:400;margin-top:4px;font-family:var(--font-sans);color:rgba(255,255,255,0.7);">Pop Culture Blast</div>
          <button class="btn btn-primary btn-full mt-20" id="join-live-btn" style="max-width:260px;margin-left:auto;margin-right:auto;">
            ⚡ Join Live Show
          </button>
        </div>
      </div>

      <div class="section" style="padding-bottom:8px;">
        <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;">
          ${cats.map((c,i) => `<div class="cat-pill ${i===0?'active':''}" data-cat="${c}">${c}</div>`).join('')}
        </div>
      </div>

      <div class="glass-square-grid mt-8 mb-16">
        <div class="glass-square" id="sq-async-1">
          <div class="sq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
          <div class="sq-title">10-Question Quiz</div>
          <div class="sq-sub">Prize pool $150</div>
        </div>
        <div class="glass-square show-entry-btn" data-id="${upcoming[0]?.id || 2}">
          <div class="sq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>
          <div class="sq-title">General Knowledge</div>
          <div class="sq-sub text-brown">$500 Prize</div>
        </div>
        <div class="glass-square" id="sq-async-2">
          <div class="sq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
          <div class="sq-title">Daily Challenge</div>
          <div class="sq-sub" style="color:var(--bg-primary)">Play Now</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header"><div class="section-title">Your Stats</div></div>
        <div class="stat-grid">
          <div class="stat-card"><div class="stat-val text-brown">${formatBalance(state.user.totalWon)}</div><div class="stat-label">Total Won</div></div>
          <div class="stat-card"><div class="stat-val text-charcoal">${state.user.streak} 🌿</div><div class="stat-label">Day Streak</div></div>
          <div class="stat-card"><div class="stat-val text-charcoal">${state.user.gamesPlayed}</div><div class="stat-label">Games Played</div></div>
          <div class="stat-card"><div class="stat-val text-green">${state.user.winRate}%</div><div class="stat-label">Win Rate</div></div>
        </div>
      </div>

      <div class="section">
        <div style="background:rgba(245,241,232,0.4);border:1px solid var(--glass-border);border-radius:20px;padding:24px;text-align:center;">
          <div style="font-size:28px;margin-bottom:8px;">🏆</div>
          <div style="font-weight:600;font-size:18px;font-family:var(--font-serif);">League Rank: <span class="text-brown">#${state.user.league.rank}</span></div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${state.user.league.points} points · Paid Tier</div>
          <button class="btn btn-outline btn-sm mt-12" id="view-league-btn">View Leaderboard →</button>
        </div>
      </div>

      <div class="section">
        <div class="section-header"><div class="section-title">Refer & Earn</div></div>
        <div class="card" style="text-align:center">
          <div style="font-size:32px;margin-bottom:8px;">🎁</div>
          <div style="font-weight:700;font-size:16px;">Earn $2 per referral</div>
          <div style="font-size:13px;color:#94a3b8;margin-top:4px;margin-bottom:16px;">Your friend gets a free life. You get $2 cash.</div>
          <div style="background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.3);border-radius:12px;padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#a855f7;margin-bottom:12px;cursor:pointer;" id="referral-code">pulse.app/ref/ALEX2026</div>
          <button class="btn btn-primary" id="share-btn">📲 Share Invite Link</button>
        </div>
      </div>
    </div>
  `;

  // Bind events
  el.querySelector('#join-live-btn')?.addEventListener('click', () => openLobby(liveShow || upcoming[0]));
  el.querySelector('#start-async-btn')?.addEventListener('click', () => navigate('async'));
  el.querySelector('#sq-async-1')?.addEventListener('click', () => navigate('async'));
  el.querySelector('#sq-async-2')?.addEventListener('click', () => navigate('async'));
  el.querySelector('#view-league-btn')?.addEventListener('click', () => navigate('league'));
  el.querySelector('#home-balance-pill')?.addEventListener('click', () => navigate('wallet'));
  el.querySelector('#share-btn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText('https://pulse.app/ref/ALEX2026');
    toast('Invite link copied!', '📋');
  });
  el.querySelector('#referral-code')?.addEventListener('click', () => {
    navigator.clipboard?.writeText('https://pulse.app/ref/ALEX2026');
    toast('Link copied!', '📋');
  });
  el.querySelectorAll('.cat-pill').forEach(p => {
    p.addEventListener('click', () => {
      el.querySelectorAll('.cat-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
    });
  });
  el.querySelectorAll('.show-entry-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.currentTarget.dataset.id);
      const show = state.shows.find(s => s.id === id);
      openLobby(show);
    });
  });

  // Countdown timer for next show
  const cdEl = el.querySelector('#home-countdown');
  if (cdEl) {
    let sec = upcoming[0]?.countdown || 3600;
    cdEl.textContent = formatCountdown(sec);
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      sec = Math.max(0, sec - 1);
      if (cdEl) cdEl.textContent = formatCountdown(sec);
    }, 1000);
  }
}

function renderShowCard(show) {
  const catColor = { general:'#a855f7', pop:'#ec4899', sports:'#06b6d4', finance:'#10b981' };
  return `
    <div class="show-card">
      <div class="show-card-header">
        ${show.hot ? `<div class="badge badge-yellow" style="position:absolute;top:14px;right:14px;">🔥 HOT</div>` : ''}
        <div style="display:flex;align-items:center;gap:10px">
          <div style="font-size:32px">${show.emoji}</div>
          <div>
            <div style="font-weight:800;font-size:16px;">${show.title}</div>
            <div style="font-size:12px;color:${catColor[show.category] || '#94a3b8'};font-weight:600;margin-top:2px">${show.category.toUpperCase()}</div>
          </div>
        </div>
      </div>
      <div class="show-card-body">
        <div style="font-size:32px;font-weight:600;font-family:var(--font-serif);" class="text-charcoal">${show.prize}</div>
        <div class="show-card-meta">
          <div class="badge badge-green">🕐 ${show.time}</div>
          <div class="badge badge-purple">👥 ${(show.players/1000).toFixed(1)}K</div>
        </div>
      </div>
      <div class="show-card-footer">
        <div>
          <div style="font-size:12px;color:#64748b">Entry</div>
          <div style="font-weight:800;font-size:16px;">${formatBalance(show.entry)}</div>
        </div>
        <button class="btn btn-primary btn-sm show-entry-btn" data-id="${show.id}">Join Show →</button>
      </div>
    </div>
  `;
}

function openLobby(show) {
  if (!show) return;
  const overlay = showModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;margin-bottom:8px;">${show.emoji}</div>
      <div class="modal-title">${show.title}</div>
      <div class="modal-sub">Prize pool: <strong style="color:#10b981">${show.prize}</strong> · ${show.players.toLocaleString()} players</div>
    </div>
    <div style="background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.3);border-radius:16px;padding:16px;margin-bottom:16px;">
      <div style="font-weight:700;margin-bottom:8px;">💡 Streak Multiplier</div>
      <div style="font-size:13px;color:#94a3b8;line-height:1.6">5 correct in a row → 1.25× payout<br/>8 in a row → 1.50×<br/>12+ in a row → 2.00× (max)</div>
    </div>
    <div class="toggle" id="insurance-toggle" style="margin-bottom:16px;background:rgba(255,255,255,.04);padding:12px;border-radius:12px;">
      <div class="toggle-track" id="insurance-track"><div class="toggle-thumb"></div></div>
      <div>
        <div style="font-weight:700;font-size:14px;">Prize Insurance (+$0.05)</div>
        <div style="font-size:12px;color:#94a3b8">Eliminated before Q5? Get your entry back.</div>
      </div>
    </div>
    <div style="margin-bottom:16px;">
      <div style="font-size:13px;color:#94a3b8;margin-bottom:8px;">Your Power-ups for this show:</div>
      <div style="display:flex;gap:8px;">
        ${state.user.powerups.timeShield > 0 ? `<div class="badge badge-purple">⏱ Time Shield ×${state.user.powerups.timeShield}</div>` : ''}
        ${state.user.powerups.doubleDown > 0 ? `<div class="badge badge-yellow">✌ Double Down ×${state.user.powerups.doubleDown}</div>` : ''}
        ${state.user.powerups.questionPeek > 0 ? `<div class="badge badge-green">👁 Question Peek ×${state.user.powerups.questionPeek}</div>` : ''}
        ${Object.values(state.user.powerups).every(v=>v===0) ? `<span style="font-size:13px;color:#64748b">None equipped · <span style="color:#a855f7;cursor:pointer" id="buy-powerup-lobby">Buy power-ups</span></span>` : ''}
      </div>
    </div>
    <button class="btn btn-primary btn-full btn-lg" id="confirm-entry-btn">
      Enter Show — ${formatBalance(show.entry)}
    </button>
    <button class="btn btn-ghost btn-full btn-sm mt-8" id="cancel-lobby-btn">Maybe later</button>
  `);

  let insured = false;
  overlay.querySelector('#insurance-track').onclick = () => {
    insured = !insured;
    overlay.querySelector('#insurance-track').classList.toggle('on', insured);
  };
  overlay.querySelector('#cancel-lobby-btn').onclick = () => overlay.remove();
  overlay.querySelector('#buy-powerup-lobby')?.addEventListener('click', () => { overlay.remove(); navigate('store'); });
  overlay.querySelector('#confirm-entry-btn').onclick = () => {
    const cost = show.entry + (insured ? 0.05 : 0);
    if (state.user.balance < cost) {
      toast('Insufficient balance! Top up your wallet.', '❌'); return;
    }
    state.user.balance -= cost;
    overlay.remove();
    startLiveShow(show);
  };
}
