// ── Shared UI Utilities ────────────────────────────────────────────────────

export function toast(msg, icon = '✅', duration = 2800) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, duration);
}

export function formatBalance(n) {
  return '$' + n.toFixed(2);
}

export function formatCountdown(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2,'0')}m`;
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

export function confetti() {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 8 + 4,
    color: ['#7c3aed','#ec4899','#06b6d4','#f59e0b','#10b981'][Math.floor(Math.random() * 5)],
    vy: Math.random() * 4 + 2,
    vx: (Math.random() - 0.5) * 3,
    angle: Math.random() * 360,
    av: (Math.random() - 0.5) * 6,
  }));
  let frames = 0;
  const max = 180;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5);
      ctx.restore();
      p.y += p.vy; p.x += p.vx; p.angle += p.av;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
    });
    frames++;
    if (frames < max) requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.remove(); }
  }
  draw();
}

export function timerRing(container, value, max, color) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  const stroke = pct > 0.5 ? '#7c3aed' : pct > 0.25 ? '#f59e0b' : '#ef4444';
  container.innerHTML = `
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle class="ring-bg" cx="40" cy="40" r="${r}"/>
      <circle class="ring-fill" cx="40" cy="40" r="${r}"
        stroke="${color || stroke}"
        stroke-dasharray="${circ}"
        stroke-dashoffset="${circ * (1 - pct)}"/>
    </svg>
    <div class="timer-text" style="color:${color || stroke}">${value}</div>
  `;
}

export function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById(`screen-${screen}`);
  if (target) { target.classList.add('active'); }
  const navItem = document.querySelector(`.nav-item[data-screen="${screen}"]`);
  if (navItem) navItem.classList.add('active');
}

export function showModal(html, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { overlay.remove(); if (onClose) onClose(); }
  });
  document.body.appendChild(overlay);
  return overlay;
}
