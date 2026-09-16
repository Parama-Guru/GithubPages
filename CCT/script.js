// ===================== CCT Pitch Deck · interactions =====================
(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;
  let animating = false;

  const progressFill = document.getElementById('progressFill');
  const dotsWrap = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const curNum = document.getElementById('curNum');
  const totNum = document.getElementById('totNum');

  if (totNum) totNum.textContent = String(total);

  slides.forEach((s, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', s.dataset.title || `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap?.appendChild(d);
  });
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

  function update() {
    progressFill.style.width = ((current + 1) / total) * 100 + '%';
    if (curNum) curNum.textContent = String(current + 1);
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === current);
      dot.setAttribute('aria-current', index === current ? 'step' : 'false');
    });
    slides.forEach((slide, index) => { slide.inert = index !== current; });
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
    if (slides[current].querySelector('[data-count]')) runCounters(slides[current]);
  }

  function goTo(idx) {
    if (animating || idx === current || idx < 0 || idx >= total) return;
    animating = true;
    const cur = slides[current];
    const nxt = slides[idx];
    cur.classList.add('leaving');
    cur.classList.remove('is-active');
    nxt.classList.add('is-active');
    nxt.scrollTop = 0;
    current = idx;
    update();
    setTimeout(() => { cur.classList.remove('leaving'); animating = false; }, 620);
  }

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);

  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('button, a, input, textarea, select, [contenteditable]')) return;
    if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
    else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
  });

  let wheelLock = false;
  window.addEventListener('wheel', e => {
    if (slides[current].scrollHeight > slides[current].clientHeight + 1) return;
    if (wheelLock || Math.abs(e.deltaY) < 24) return;
    wheelLock = true;
    e.deltaY > 0 ? next() : prev();
    setTimeout(() => (wheelLock = false), 750);
  }, { passive: true });

  let touchX = 0, touchY = 0;
  window.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
  }, { passive: true });

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function runCounters(slide) {
    slide.querySelectorAll('[data-count]').forEach(el => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1100;
      const start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    });
  }

  update();

  // ===================== Particle canvas (light theme) =====================
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const COLORS = ['108,127,240', '242,131,111', '236,111,160', '205,190,241'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(64, Math.floor((W * H) / 28000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: Math.random() * 0.35 + 0.15
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = dx * dx + dy * dy;
        if (dist < 16000) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${p.c},${0.07 * (1 - dist / 16000)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
