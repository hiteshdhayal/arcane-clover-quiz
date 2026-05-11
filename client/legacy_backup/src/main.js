import './style.css';
import { renderOnboarding } from './screens/onboarding.js';
import { renderHome } from './screens/home.js';
import { renderLeague } from './screens/league.js';
import { renderWallet } from './screens/wallet.js';
import { renderStore } from './screens/store.js';
import { renderProfile } from './screens/profile.js';
import { renderAsync } from './screens/async.js';
import { navigate } from './utils.js';

// ── Bootstrap App Shell ────────────────────────────────────────────────────
document.getElementById('app').innerHTML = `
  <!-- Screens -->
  <div id="screen-onboard" class="screen active"></div>
  <div id="screen-home" class="screen"></div>
  <div id="screen-live" class="screen"></div>
  <div id="screen-league" class="screen"></div>
  <div id="screen-wallet" class="screen"></div>
  <div id="screen-store" class="screen"></div>
  <div id="screen-profile" class="screen"></div>
  <div id="screen-async" class="screen"></div>

  <!-- Bottom Nav (hidden until logged in) -->
  <nav class="bottom-nav" id="bottom-nav" style="display:none;">
    <button class="nav-item active" data-screen="home" id="nav-home">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Home</span>
    </button>
    <button class="nav-item" data-screen="league" id="nav-league">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
      <span>League</span>
    </button>
    <button class="nav-item" data-screen="async" id="nav-async" style="position:relative;">
      <div style="position:absolute;top:4px;right:22px;width:8px;height:8px;background:var(--accent-green);border-radius:50%;"></div>
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      <span>Daily</span>
    </button>
    <button class="nav-item" data-screen="wallet" id="nav-wallet">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      <span>Wallet</span>
    </button>
    <button class="nav-item" data-screen="store" id="nav-store">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      <span>Store</span>
    </button>
    <button class="nav-item" data-screen="profile" id="nav-profile">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>Me</span>
    </button>
  </nav>
`;

// ── Render all screens ─────────────────────────────────────────────────────
renderOnboarding();
renderHome();
renderLeague();
renderWallet();
renderStore();
renderProfile();

// ── Nav wiring ─────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const screen = btn.dataset.screen;
    navigate(screen);
    // Re-render mutable screens
    if (screen === 'home') renderHome();
    if (screen === 'league') renderLeague();
    if (screen === 'wallet') renderWallet();
    if (screen === 'store') renderStore();
    if (screen === 'profile') renderProfile();
    if (screen === 'async') renderAsync();
  });
});

// ── Async countdown ticker ─────────────────────────────────────────────────
import { state } from './state.js';
setInterval(() => {
  if (state.asyncChallenge.timeLeft > 0) state.asyncChallenge.timeLeft--;
}, 1000);

// ── Expose navigate globally for inline event handlers ─────────────────────
window.navigate = (s) => {
  navigate(s);
  if (s === 'home') renderHome();
  if (s === 'wallet') renderWallet();
  if (s === 'store') renderStore();
};
