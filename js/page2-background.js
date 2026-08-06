/**
 * Page 2 background: a quiet drifting particle "constellation" field —
 * same body color as page 1, deliberately calmer than the page-1 jelly
 * blobs so the two pages feel related but distinct. Colors are pulled
 * live from the CSS custom properties, so light/dark mode just works.
 */
(function () {
  const canvas = document.getElementById('page2Bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let particles = [];
  let colors = readColors();

  function readColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
      bg: styles.getPropertyValue('--bg').trim(),
      dots: [
        styles.getPropertyValue('--c-tilde').trim(),
        styles.getPropertyValue('--c-bars').trim(),
        styles.getPropertyValue('--c-equal').trim(),
        styles.getPropertyValue('--c-fwd').trim(),
      ],
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles();
  }

  function seedParticles() {
    // density scales with area, capped for very large / very small screens
    const count = Math.round(Math.min(90, Math.max(28, (width * height) / 22000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 1 + Math.random() * 1.8,
      colorIdx: Math.floor(Math.random() * colors.dots.length),
    }));
  }

  const LINK_DIST = 130;

  function step() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });

    // connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.18;
          ctx.strokeStyle = `rgba(${colors.dots[a.colorIdx]}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // dots
    particles.forEach((p) => {
      ctx.fillStyle = `rgba(${colors.dots[p.colorIdx]}, 0.55)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reducedMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mt:themechange', () => {
    colors = readColors();
  });

  resize();
  if (reducedMotion) {
    step(); // draw a single static frame
  } else {
    requestAnimationFrame(step);
  }
})();
