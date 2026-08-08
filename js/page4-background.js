/**
 * Page 4 background — floating colored balls.
 * Radar UI removed: no rings, crosshairs, sweep beam, or pings.
 */
(function () {
  const canvas = document.getElementById('page4Bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let width, height, dpr, cx, cy, maxRadius;
  let nodes = [];
  let colors = readColors();
  let lastTime = performance.now();

  function readColors() {
    const s = getComputedStyle(document.documentElement);

    return {
      accents: [
        s.getPropertyValue('--c-tilde').trim(),
        s.getPropertyValue('--c-bars').trim(),
        s.getPropertyValue('--c-back').trim(),
        s.getPropertyValue('--c-fwd').trim(),
        s.getPropertyValue('--c-equal').trim()
      ]
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
    const count = Math.round(
      Math.min(16, Math.max(6, width / 110))
    );

    nodes = Array.from({ length: count }, (_, i) => ({
      radius: maxRadius * (0.18 + Math.random() * 0.75),

      angle: Math.random() * Math.PI * 2,

      speed: (Math.random() - 0.5) * 0.35,

      size: 1.6 + Math.random() * 1.8,

      colorIdx: i % colors.accents.length
    }));
  }

  function drawNodes() {
    nodes.forEach((node) => {
      const x =
        cx + Math.cos(node.angle) * node.radius;

      const y =
        cy + Math.sin(node.angle) * node.radius;

      ctx.beginPath();

      ctx.fillStyle =
        `rgba(${colors.accents[node.colorIdx]}, 0.75)`;

      ctx.shadowBlur = 8;

      ctx.shadowColor =
        `rgb(${colors.accents[node.colorIdx]})`;

      ctx.arc(
        x,
        y,
        node.size,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.shadowBlur = 0;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Only the moving colored balls
    drawNodes();
  }

  function step(now) {
    const dt = Math.min(
      0.05,
      (now - lastTime) / 1000
    );

    lastTime = now;

    // Move balls around in space
    nodes.forEach((node) => {
      node.angle += node.speed * dt;
      node.angle %= Math.PI * 2;
      // node.colorIdx = (node.colorIdx + 1) % colors.accents.length;
      node.size = 1.6 + Math.random() * 1.8;
      // node.colorIdx = (node.colorIdx + 1) % colors.accents.length;
      // node.radius = maxRadius * (0.18 + Math.random() * 0.75);
      // node.speed = (Math.random() - 0.5) * 0.35;
      // node.angle += node.speed * dt;

    });

    draw();

    if (!reducedMotion) {
      requestAnimationFrame(step);
    }
  }

  window.addEventListener(
    'resize',
    resize,
    { passive: true }
  );

  window.addEventListener(
    'mt:themechange',
    () => {
      colors = readColors();
    }
  );

  resize();

  if (reducedMotion) {
    draw();
  } else {
    requestAnimationFrame(step);
  }
})();