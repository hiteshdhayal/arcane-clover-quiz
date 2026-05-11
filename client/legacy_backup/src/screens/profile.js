import { state } from '../state.js';
import { navigate, toast, formatBalance } from '../utils.js';

export function renderProfile() {
  const el = document.getElementById('screen-profile');
  el.innerHTML = `
    <div style="background:var(--bg);min-height:100vh;">
      <div class="page-header">
        <div style="font-size:22px;font-weight:900" class="grad-text">Profile</div>
        <button class="btn btn-ghost btn-sm" id="settings-btn">⚙ Settings</button>
      </div>
      <div class="content">

        <div class="section" style="padding-bottom:0;text-align:center;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0;">
            <div class="avatar avatar-lg" style="width:80px;height:80px;font-size:32px;box-shadow:var(--glow);">${state.user.initials}</div>
            <div>
              <div style="font-size:24px;font-weight:900;">${state.user.name}</div>
              <div style="font-size:14px;color:#94a3b8;margin-top:2px;">Member since May 2026 · Paid Tier</div>
            </div>
            <div style="display:flex;gap:8px;">
              <div class="badge badge-purple">⚡ Rank #${state.user.league.rank}</div>
              <div class="badge badge-yellow">🔥 ${state.user.streak}-day streak</div>
              <div class="badge badge-green">✓ Verified</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="stat-grid">
            <div class="stat-card"><div class="stat-val grad-text">${formatBalance(state.user.totalWon)}</div><div class="stat-label">Total Won</div></div>
            <div class="stat-card"><div class="stat-val" style="color:#06b6d4">${state.user.gamesPlayed}</div><div class="stat-label">Games Played</div></div>
            <div class="stat-card"><div class="stat-val" style="color:#10b981">${state.user.winRate}%</div><div class="stat-label">Win Rate</div></div>
            <div class="stat-card"><div class="stat-val" style="color:#ec4899">${state.user.referrals}</div><div class="stat-label">Referrals</div></div>
          </div>
        </div>

        <div class="section" style="padding-top:0">
          <div class="section-header"><div class="section-title">🏅 Badges</div></div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            ${[
              { icon:'🔥', label:'7-Day Streak' },
              { icon:'🎯', label:'First Win' },
              { icon:'👑', label:'Top 100' },
              { icon:'📱', label:'Early Adopter' },
              { icon:'🤝', label:'Referral Hero' },
            ].map(b => `
              <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:12px 14px;text-align:center;">
                <div style="font-size:24px;">${b.icon}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px;font-weight:600;">${b.label}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section" style="padding-top:0">
          <div class="section-header"><div class="section-title">🎮 Recent Games</div></div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${[
              { title:'Pop Culture Blast', result:'Won', amount:'+$12.50', q:'12/12', date:'Today', color:'#10b981' },
              { title:'General Knowledge', result:'Eliminated', amount:'-$1.00', q:'8/12', date:'Yesterday', color:'#ef4444' },
              { title:'Sports Trivia Pro', result:'Won', amount:'+$8.40', q:'12/12', date:'May 10', color:'#10b981' },
              { title:'Pop Culture Blast', result:'Won', amount:'+$6.20', q:'12/12', date:'May 9', color:'#10b981' },
            ].map(g => `
              <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight:700;font-size:14px;">${g.title}</div>
                  <div style="font-size:12px;color:#64748b;margin-top:2px;">${g.date} · ${g.q} questions</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-weight:800;color:${g.color};font-family:'JetBrains Mono',monospace;">${g.amount}</div>
                  <div style="font-size:11px;color:${g.color};margin-top:2px;">${g.result}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section" style="padding-top:0;">
          <div class="section-header"><div class="section-title">📲 Refer & Earn</div></div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:20px;">
            <div style="font-size:14px;color:#94a3b8;margin-bottom:10px;">You've referred <strong style="color:#fff">${state.user.referrals} friends</strong>. Earn $2 per successful referral.</div>
            <div style="background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.3);border-radius:12px;padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#a855f7;cursor:pointer;margin-bottom:12px;" id="profile-ref-code">pulse.app/ref/ALEX2026</div>
            <button class="btn btn-primary btn-full" id="profile-share">📲 Share Invite Link</button>
          </div>
        </div>

        <div class="section" style="padding-top:0;">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;overflow:hidden;">
            ${[
              { label:'🔔 Notifications', sub:'Show alerts, result notifications' },
              { label:'🔊 Sound Effects', sub:'In-show audio cues' },
              { label:'📍 State Eligibility', sub:'Verified: Eligible to win prizes' },
              { label:'🔒 Privacy Policy', sub:'See how we use your data' },
              { label:'📜 Terms of Service', sub:'Rules & regulations' },
            ].map(item => `
              <div style="padding:16px;border-bottom:1px solid rgba(255,255,255,.04);display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
                <div>
                  <div style="font-weight:600;font-size:15px;">${item.label}</div>
                  <div style="font-size:12px;color:#64748b;margin-top:2px;">${item.sub}</div>
                </div>
                <svg width="16" height="16" fill="none" stroke="#64748b" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            `).join('')}
            <div style="padding:16px;cursor:pointer;" id="signout-btn">
              <div style="font-weight:600;font-size:15px;color:#ef4444;">🚪 Sign Out</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  el.querySelector('#profile-share').addEventListener('click', () => { navigator.clipboard?.writeText('https://pulse.app/ref/ALEX2026'); toast('Link copied!', '📋'); });
  el.querySelector('#profile-ref-code').addEventListener('click', () => { navigator.clipboard?.writeText('https://pulse.app/ref/ALEX2026'); toast('Link copied!', '📋'); });
  el.querySelector('#signout-btn').addEventListener('click', () => {
    if (confirm('Sign out of Pulse?')) {
      document.getElementById('bottom-nav').style.display = 'none';
      navigate('onboard');
    }
  });
}
