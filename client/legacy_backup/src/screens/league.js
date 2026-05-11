import { state } from '../state.js';
import { navigate, toast, formatBalance } from '../utils.js';

export function renderLeague() {
  const el = document.getElementById('screen-league');
  const lb = state.leaderboard;

  el.innerHTML = `
    <div style="background:var(--bg);min-height:100vh;">
      <div class="page-header">
        <div style="font-size:22px;font-weight:900" class="grad-text">League</div>
        <div class="badge badge-purple">May 2026</div>
      </div>
      <div class="content">
        <div class="section" style="padding-bottom:0">
          <div class="my-rank-card">
            <div style="font-size:40px;margin-bottom:4px;">⚡</div>
            <div style="font-size:14px;color:#94a3b8;margin-bottom:4px;">YOUR RANK</div>
            <div style="font-size:48px;font-weight:900;" class="grad-text">#${state.user.league.rank}</div>
            <div style="color:#94a3b8;margin-top:4px;">${state.user.league.points.toLocaleString()} points</div>
            <div style="font-size:13px;color:#64748b;margin-top:8px;">🏅 Top 100 earns a badge + bonus prize</div>
          </div>
        </div>

        <div class="section" style="padding-bottom:0">
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <button class="cat-pill active" id="tab-paid" data-tab="paid">💰 Paid Tier</button>
            <button class="cat-pill" id="tab-free" data-tab="free">🆓 Free Tier</button>
          </div>
        </div>

        <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;margin:0 16px;overflow:hidden;">
          <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
            <span style="font-size:13px;color:#64748b;font-weight:600">RANK</span>
            <span style="font-size:13px;color:#64748b;font-weight:600">PLAYER</span>
            <span style="font-size:13px;color:#64748b;font-weight:600">WINNINGS</span>
          </div>
          ${lb.map(p => `
            <div class="lb-row ${p.isMe ? 'style="background:rgba(124,58,237,.1);border-left:3px solid #7c3aed;"' : ''}">
              <div class="lb-rank ${p.rank <= 3 ? 'grad-text' : ''}">${p.badge || p.rank}</div>
              <div style="width:36px;height:36px;border-radius:50%;background:${p.isMe ? 'var(--grad)' : 'var(--surface2)'};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;">${p.initials}</div>
              <div class="lb-name ${p.isMe ? 'text-purple' : ''}">${p.name}${p.isMe ? ' 👈' : ''}</div>
              <div class="lb-score">${p.score}</div>
            </div>
          `).join('')}
          <div style="padding:16px;text-align:center;border-top:1px solid var(--border);">
            <span style="font-size:13px;color:#64748b">... 847 more players ...</span>
          </div>
        </div>

        <div class="section">
          <div class="section-header"><div class="section-title">🏅 Prize Structure</div></div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${[
              { rank:'🥇 Rank 1', prize:'$500 + Gold Badge', color:'#f59e0b' },
              { rank:'🥈 Rank 2', prize:'$300 + Silver Badge', color:'#94a3b8' },
              { rank:'🥉 Rank 3', prize:'$200 + Bronze Badge', color:'#cd7c3b' },
              { rank:'Top 10', prize:'$50 + Badge', color:'#7c3aed' },
              { rank:'Top 100', prize:'$10 + Profile Badge', color:'#06b6d4' },
            ].map(r => `
              <div style="display:flex;justify-content:space-between;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:12px 16px;">
                <span style="font-weight:700">${r.rank}</span>
                <span style="color:${r.color};font-weight:700;font-size:13px;">${r.prize}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <div style="background:linear-gradient(135deg,rgba(6,182,212,.15),rgba(124,58,237,.1));border:1px solid rgba(6,182,212,.3);border-radius:20px;padding:20px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">👥</div>
            <div style="font-weight:800;font-size:18px;margin-bottom:6px;">Clan Mode — Coming Month 7</div>
            <div style="font-size:13px;color:#94a3b8;line-height:1.6">Form a squad of 5. Compete as a team. Win together. Reduce churn by having teammates who count on you.</div>
            <button class="btn btn-outline btn-sm mt-12" id="clan-notify">🔔 Notify Me</button>
          </div>
        </div>
      </div>
    </div>
  `;

  el.querySelector('#clan-notify').addEventListener('click', () => toast('We\'ll notify you when Clan mode launches!', '🔔'));
  el.querySelectorAll('.cat-pill').forEach(p => {
    p.addEventListener('click', () => {
      el.querySelectorAll('.cat-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
    });
  });
}
