/**
 * Page 4 background — radar / scanner sweep.
 *
 * Third in the "tech HUD" progression: page 2 was a soft particle network,
 * page 3 was rectilinear circuit traces with flowing pulses. This one is
 * radial — concentric rings, crosshairs, a continuously rotating sweep
 * beam, small nodes orbiting at different radii/speeds, and the occasional
 * expanding detection "ping" — fitting a page literally titled Research,
 * like the site is scanning/profiling you. Same accent palette as the
 * other pages for continuity.
 */
(function () {
  const canvas = document.getElementById('page4Bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr, cx, cy, maxRadius;
  let nodes = [];
  let pings = [];
  let sweepAngle = 0;
  let colors = readColors();
  let lastTime = performance.now();
  let lastPing = 0;

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    return {
      ring: s.getPropertyValue('--border').trim() || 'rgba(255,255,255,0.1)',
      sweep: s.getPropertyValue('--c-bars').trim(),
      accents: [
        s.getPropertyValue('--c-tilde').trim(),
        s.getPropertyValue('--c-bars').trim(),
        s.getPropertyValue('--c-back').trim(),
        s.getPropertyValue('--c-fwd').trim(),
        s.getPropertyValue('--c-equal').trim(),
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

    cx = width / 2;
    cy = height / 2;
    maxRadius = Math.hypot(width, height) / 2;

    seedNodes();
  }

  function seedNodes() {
    const count = Math.round(Math.min(16, Math.max(6, width / 110)));
    nodes = Array.from({ length: count }, (_, i) => ({
      radius: maxRadius * (0.18 + Math.random() * 0.75),
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() - 0.5) * 0.35, // radians/sec, some CW some CCW
      size: 1.6 + Math.random() * 1.8,
      colorIdx: i % colors.accents.length,
    }));
  }

  function drawRings() {
    ctx.strokeStyle = colors.ring;
    ctx.lineWidth = 1;
    const ringCount = 5;
    for (let i = 1; i <= ringCount; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (maxRadius * i) / ringCount, 0, Math.PI * 2);
      ctx.globalAlpha = 0.5;
      ctx.stroke();
    }
    // crosshairs
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawSweep() {
    const sweepWidth = 0.65; // radians
    const grad = ctx.createConicGradient
      ? ctx.createConicGradient(sweepAngle - sweepWidth, cx, cy)
      : null;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxRadius, sweepAngle - sweepWidth, sweepAngle);
    ctx.closePath();

    if (grad) {
      grad.addColorStop(0, `rgba(${colors.sweep}, 0)`);
      grad.addColorStop(1, `rgba(${colors.sweep}, 0.22)`);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = `rgba(${colors.sweep}, 0.12)`;
    }
    ctx.fill();

    // bright leading edge
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * maxRadius, cy + Math.sin(sweepAngle) * maxRadius);
    ctx.strokeStyle = `rgba(${colors.sweep}, 0.55)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawNodes() {
    nodes.forEach((n) => {
      const x = cx + Math.cos(n.angle) * n.radius;
      const y = cy + Math.sin(n.angle) * n.radius;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${colors.accents[n.colorIdx]}, 0.75)`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgb(${colors.accents[n.colorIdx]})`;
      ctx.arc(x, y, n.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function drawPings() {
    pings.forEach((p) => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${colors.sweep}, ${p.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.arc(cx, cy, p.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawRings();
    drawSweep();
    drawPings();
    drawNodes();
  }

  function step(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    sweepAngle += dt * 0.9; // one revolution roughly every 7s
    nodes.forEach((n) => (n.angle += n.speed * dt));

    // spawn a detection ping every ~2.5s
    lastPing += dt;
    if (lastPing > 2.5) {
      lastPing = 0;
      pings.push({ radius: 0, alpha: 0.5 });
    }
    pings.forEach((p) => {
      p.radius += dt * (maxRadius / 1.8);
      p.alpha = Math.max(0, 0.5 * (1 - p.radius / maxRadius));
    });
    pings = pings.filter((p) => p.alpha > 0.02);

    draw();
    if (!reducedMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mt:themechange', () => {
    colors = readColors();
  });

  resize();
  if (reducedMotion) {
    draw(); // single static frame
  } else {
    requestAnimationFrame(step);
  }
})();
