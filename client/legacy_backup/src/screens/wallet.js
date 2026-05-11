import { state } from '../state.js';
import { navigate, toast, formatBalance, showModal } from '../utils.js';

export function renderWallet() {
  const el = document.getElementById('screen-wallet');
  const txTypeColor = { win:'#10b981', entry:'#ef4444', withdraw:'#f59e0b', topup:'#06b6d4', item:'#a855f7', bonus:'#ec4899' };
  const txIcon = { win:'🏆', entry:'🎯', withdraw:'💸', topup:'💳', item:'⚡', bonus:'🎁' };

  el.innerHTML = `
    <div style="background:var(--bg);min-height:100vh;">
      <div class="page-header">
        <div style="font-size:22px;font-weight:900" class="grad-text">Wallet</div>
        <div class="badge badge-green">Solana</div>
      </div>
      <div class="content">

        <div class="section" style="padding-bottom:0">
          <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);border-radius:28px;padding:28px 24px;text-align:center;position:relative;overflow:hidden;">
            <div class="orb" style="background:#fff;width:200px;height:200px;top:-80px;right:-60px;opacity:.05;filter:blur(40px)"></div>
            <div style="font-size:14px;font-weight:600;opacity:.8;margin-bottom:4px;">AVAILABLE BALANCE</div>
            <div style="font-size:52px;font-weight:900;font-family:'JetBrains Mono',monospace;" id="wallet-balance">${formatBalance(state.user.balance)}</div>
            <div style="font-size:13px;opacity:.7;margin-top:4px;">≈ ${state.user.balance.toFixed(2)} USDC · Solana</div>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
              <button class="btn btn-sm" style="background:rgba(255,255,255,.2);color:#fff;border:none;" id="topup-btn">+ Add Funds</button>
              <button class="btn btn-sm" style="background:rgba(255,255,255,.2);color:#fff;border:none;" id="withdraw-btn">↑ Withdraw</button>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="stat-grid">
            <div class="stat-card" style="background:rgba(16,185,129,.1);border-color:rgba(16,185,129,.3)">
              <div class="stat-val" style="color:#10b981">${formatBalance(state.user.totalWon)}</div>
              <div class="stat-label">Total Won</div>
            </div>
            <div class="stat-card">
              <div class="stat-val" style="color:#a855f7">$1.00</div>
              <div class="stat-label">Avg Entry</div>
            </div>
          </div>
        </div>

        <div class="section" style="padding-top:0">
          <div class="section-header"><div class="section-title">Transaction History</div></div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;overflow:hidden;">
            ${state.transactions.map(tx => `
              <div class="tx-row" style="padding:14px 16px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:40px;height:40px;background:var(--bg3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;">${txIcon[tx.type]}</div>
                  <div>
                    <div class="tx-label">${tx.label}</div>
                    <div class="tx-sub">${tx.date}</div>
                  </div>
                </div>
                <div class="tx-amount" style="color:${txTypeColor[tx.type]}">${tx.amount}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:20px;">
            <div style="font-size:16px;font-weight:800;margin-bottom:12px;">🔐 About Your Wallet</div>
            <div style="font-size:13px;color:#94a3b8;line-height:1.8">
              Your balance is held in <strong style="color:#a855f7">USDC on Solana</strong> via a Privy embedded wallet. You never need to know this — it just works.<br/><br/>
              Withdrawals go to your debit card via Stripe. Typical transfer time: <strong style="color:#10b981">under 3 minutes</strong>.
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  el.querySelector('#topup-btn').addEventListener('click', () => showTopupModal());
  el.querySelector('#withdraw-btn').addEventListener('click', () => showWithdrawModal());
}

function showTopupModal() {
  const amounts = [5, 10, 20, 50];
  const overlay = showModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">Add Funds</div>
    <div class="modal-sub">Funds are added instantly via Stripe</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
      ${amounts.map(a => `
        <button class="btn btn-secondary topup-amount" data-amount="${a}">$${a}</button>
      `).join('')}
    </div>
    <div style="margin-bottom:16px;">
      <input type="number" class="input" id="custom-amount" placeholder="Custom amount" min="1" max="500" />
    </div>
    <button class="btn btn-primary btn-full" id="confirm-topup">
      💳 Pay with Apple Pay / Card
    </button>
  `);

  let selected = 10;
  overlay.querySelectorAll('.topup-amount').forEach(btn => {
    btn.addEventListener('click', () => {
      selected = parseInt(btn.dataset.amount);
      overlay.querySelectorAll('.topup-amount').forEach(b => b.classList.remove('btn-primary'));
      btn.classList.add('btn-primary');
    });
  });

  overlay.querySelector('#confirm-topup').addEventListener('click', () => {
    const custom = parseFloat(overlay.querySelector('#custom-amount').value);
    const amount = custom > 0 ? custom : selected;
    state.user.balance += amount;
    overlay.remove();
    toast(`💰 $${amount.toFixed(2)} added to your balance!`, '✅');
    renderWallet();
  });
}

function showWithdrawModal() {
  const overlay = showModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">Withdraw Funds</div>
    <div class="modal-sub">Transfer to your debit card in under 3 minutes</div>
    <div style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);border-radius:14px;padding:14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:14px;color:#94a3b8">Available</span>
      <span style="font-size:20px;font-weight:900;color:#10b981;font-family:'JetBrains Mono',monospace">${formatBalance(state.user.balance)}</span>
    </div>
    <div class="input-group" style="margin-bottom:16px;">
      <label class="input-label">Amount to withdraw</label>
      <input type="number" class="input" id="withdraw-amount" placeholder="0.00" max="${state.user.balance.toFixed(2)}" />
    </div>
    <div class="input-group" style="margin-bottom:16px;">
      <label class="input-label">Debit card (last 4)</label>
      <input type="text" class="input" id="card-last4" placeholder="•••• •••• •••• 4242" />
    </div>
    <button class="btn btn-primary btn-full" id="confirm-withdraw">Withdraw via Stripe →</button>
  `);

  overlay.querySelector('#confirm-withdraw').addEventListener('click', () => {
    const amount = parseFloat(overlay.querySelector('#withdraw-amount').value);
    if (!amount || amount <= 0 || amount > state.user.balance) {
      toast('Enter a valid amount', '⚠️'); return;
    }
    state.user.balance -= amount;
    state.transactions.unshift({ id: Date.now(), label:'Withdrew to Debit', amount:`-$${amount.toFixed(2)}`, date:'Just now', type:'withdraw' });
    overlay.remove();
    toast(`💸 $${amount.toFixed(2)} on its way to your debit card!`, '✅', 3500);
    renderWallet();
  });
}
