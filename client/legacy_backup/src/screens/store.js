import { state } from '../state.js';
import { navigate, toast, formatBalance, showModal } from '../utils.js';
import { renderWallet } from './wallet.js';

export function renderStore() {
  const el = document.getElementById('screen-store');
  const powerups = [
    {
      key: 'timeShield', icon: '⏱', name: 'Time Shield',
      desc: 'Adds +3 seconds to your timer on one question per show.',
      price: 0.10, badge: 'TACTICAL',
    },
    {
      key: 'doubleDown', icon: '✌️', name: 'Double Down',
      desc: 'Doubles your prize-pool share weight on one correct answer.',
      price: 0.25, badge: 'BOLD',
    },
    {
      key: 'questionPeek', icon: '👁', name: 'Question Peek',
      desc: 'See the category of the next question 5 seconds early.',
      price: 0.15, badge: 'SMART',
    },
  ];

  el.innerHTML = `
    <div style="background:var(--bg);min-height:100vh;">
      <div class="page-header">
        <div style="font-size:22px;font-weight:900" class="grad-text">Power-Ups</div>
        <div class="balance-pill" id="store-balance">
          💰 ${formatBalance(state.user.balance)}
        </div>
      </div>
      <div class="content">

        <div class="section" style="padding-bottom:0">
          <div style="background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(236,72,153,.1));border:1px solid rgba(124,58,237,.3);border-radius:20px;padding:16px;text-align:center;margin-bottom:8px;">
            <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">Power-ups give an edge — but skill still wins.</div>
            <div style="font-size:12px;color:#64748b;">Used before a show starts. One per show per type.</div>
          </div>
        </div>

        <div class="section">
          <div class="section-header"><div class="section-title">Your Inventory</div></div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${state.user.powerups.timeShield > 0 ? `<div class="badge badge-purple">⏱ Time Shield ×${state.user.powerups.timeShield}</div>` : ''}
            ${state.user.powerups.doubleDown > 0 ? `<div class="badge badge-yellow">✌ Double Down ×${state.user.powerups.doubleDown}</div>` : ''}
            ${state.user.powerups.questionPeek > 0 ? `<div class="badge badge-green">👁 Question Peek ×${state.user.powerups.questionPeek}</div>` : ''}
            ${Object.values(state.user.powerups).every(v=>v===0) ? '<span style="color:#64748b;font-size:14px">No power-ups yet</span>' : ''}
          </div>
        </div>

        <div class="section" style="padding-top:0">
          <div style="display:grid;grid-template-columns:1fr;gap:14px;">
            ${powerups.map(p => `
              <div class="powerup-card ${state.user.powerups[p.key] > 0 ? 'owned' : ''}" style="flex-direction:row;align-items:flex-start;gap:16px;text-align:left;">
                <div style="font-size:40px;flex-shrink:0;">${p.icon}</div>
                <div style="flex:1;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="font-weight:800;font-size:17px;">${p.name}</div>
                    <div class="badge badge-purple" style="font-size:9px;">${p.badge}</div>
                  </div>
                  <div style="font-size:13px;color:#94a3b8;margin-top:6px;line-height:1.5;">${p.desc}</div>
                  ${state.user.powerups[p.key] > 0 ? `<div style="font-size:12px;color:#10b981;margin-top:6px;font-weight:700;">✓ You have ${state.user.powerups[p.key]}</div>` : ''}
                  <div style="display:flex;gap:8px;margin-top:12px;">
                    <button class="btn btn-primary btn-sm buy-pu" data-key="${p.key}" data-price="${p.price}">Buy — $${p.price.toFixed(2)}</button>
                    <button class="btn btn-secondary btn-sm bundle-pu" data-key="${p.key}" data-price="${(p.price * 3 * 0.8).toFixed(2)}">3-Pack — $${(p.price * 3 * 0.8).toFixed(2)}</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-header"><div class="section-title">🛡 Extra Lives</div></div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <div>
                <div style="font-weight:800;font-size:16px;">❤️ Extra Life</div>
                <div style="font-size:13px;color:#94a3b8;margin-top:4px;">Get a second chance if eliminated before Q5</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:20px;font-weight:900;color:#ec4899">$0.10</div>
                <div style="font-size:11px;color:#64748b">per life</div>
              </div>
            </div>
            <div style="font-size:13px;color:#64748b;margin-bottom:16px;">You have <strong style="color:#f8fafc">${state.user.lives}</strong> free life today. Resets every 24h.</div>
            <button class="btn btn-outline btn-full" id="buy-life-btn">Buy Extra Life — $0.10</button>
          </div>
        </div>

        <div class="section">
          <div style="background:linear-gradient(135deg,rgba(236,72,153,.15),rgba(124,58,237,.1));border:1px solid rgba(236,72,153,.3);border-radius:20px;padding:20px;text-align:center;">
            <div style="font-size:28px;margin-bottom:8px;">🎟</div>
            <div style="font-weight:800;font-size:17px;margin-bottom:6px;">Prize Insurance</div>
            <div style="font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:12px;">Add insurance when entering any show. Eliminated before Q5? Your entry fee is refunded.</div>
            <div style="font-size:22px;font-weight:900;color:#ec4899">+$0.05 / show</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">Available in the show lobby</div>
          </div>
        </div>

      </div>
    </div>
  `;

  el.querySelectorAll('.buy-pu').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const price = parseFloat(btn.dataset.price);
      if (state.user.balance < price) { toast('Not enough balance!', '❌'); return; }
      state.user.balance -= price;
      state.user.powerups[key]++;
      toast(`✅ ${key === 'timeShield' ? 'Time Shield' : key === 'doubleDown' ? 'Double Down' : 'Question Peek'} purchased!`, '⚡');
      renderStore();
    });
  });

  el.querySelectorAll('.bundle-pu').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const price = parseFloat(btn.dataset.price);
      if (state.user.balance < price) { toast('Not enough balance!', '❌'); return; }
      state.user.balance -= price;
      state.user.powerups[key] += 3;
      toast(`🎁 3-Pack purchased! 20% discount applied.`, '✅');
      renderStore();
    });
  });

  el.querySelector('#buy-life-btn').addEventListener('click', () => {
    if (state.user.balance < 0.10) { toast('Not enough balance!', '❌'); return; }
    state.user.balance -= 0.10;
    state.user.lives++;
    toast('❤️ Extra life added!', '✅');
    renderStore();
  });

  el.querySelector('#store-balance').addEventListener('click', () => navigate('wallet'));
}
