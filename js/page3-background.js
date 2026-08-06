/**
 * Page 3 background — "circuit board" blueprint.
 *
 * Distinct on purpose from page 1 (organic jelly blobs) and page 2 (drifting
 * particle network): here the lines are rectilinear, static "traces" like a
 * PCB, and small glowing pulses continuously travel along them — signal
 * flowing through the stack, fitting the "toolbox" theme of this page.
 * Colors are pulled from the same accent palette as page 1's blobs, so the
 * pages feel related even though the motion language is completely different.
 */
(function () {
  const canvas = document.getElementById('page3Bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let traces = [];
  let pulses = [];
  let colors = readColors();
  let lastTime = performance.now();

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    return {
      line: s.getPropertyValue('--border').trim() || 'rgba(255,255,255,0.1)',
      pad: s.getPropertyValue('--ink-dim').trim() || '#9AA7C7',
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
    buildTraces();
  }

  /** Procedurally walk a right-angle path across a grid, like a PCB trace. */
  function buildTraces() {
    const cell = Math.max(64, Math.min(120, width / 13));
    const cols = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    const count = Math.round(Math.min(22, Math.max(9, (width * height) / 90000)));

    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
    ];

    traces = Array.from({ length: count }, () => {
      let col = Math.floor(Math.random() * cols);
      let row = Math.floor(Math.random() * rows);
      const points = [{ x: col * cell, y: row * cell }];
      const segments = 3 + Math.floor(Math.random() * 5);
      let lastDir = null;

      for (let i = 0; i < segments; i++) {
        let dir;
        do {
          dir = dirs[Math.floor(Math.random() * dirs.length)];
        } while (lastDir && dir[0] === -lastDir[0] && dir[1] === -lastDir[1]);
        lastDir = dir;

        const steps = 1 + Math.floor(Math.random() * 2);
        col = Math.min(cols, Math.max(0, col + dir[0] * steps));
        row = Math.min(rows, Math.max(0, row + dir[1] * steps));
        points.push({ x: col * cell, y: row * cell });
      }

      // total path length, for even pulse speed along uneven segment lengths
      let length = 0;
      for (let i = 1; i < points.length; i++) {
        length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      }

      return { points, length };
    });

    // one pulse per trace, staggered start + varied speed/color
    pulses = traces.map((trace, i) => ({
      trace,
      progress: Math.random(), // 0..1 along the path
      speed: 0.09 + Math.random() * 0.09, // loops per second
      colorIdx: i % colors.accents.length,
    }));
  }

  function pointAt(trace, t) {
    const targetDist = t * trace.length;
    let covered = 0;
    const pts = trace.points;
    for (let i = 1; i < pts.length; i++) {
      const segLen = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      if (covered + segLen >= targetDist || i === pts.length - 1) {
        const segT = segLen === 0 ? 0 : (targetDist - covered) / segLen;
        return {
          x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * segT,
          y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * segT,
        };
      }
      covered += segLen;
    }
    return pts[pts.length - 1];
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // static traces + pin pads
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    traces.forEach((trace) => {
      ctx.beginPath();
      trace.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      const start = trace.points[0];
      const end = trace.points[trace.points.length - 1];
      ctx.strokeStyle = colors.pad;
      ctx.globalAlpha = 0.35;
      [start, end].forEach((p) => ctx.strokeRect(p.x - 3, p.y - 3, 6, 6));
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.line;
    });

    // traveling signal pulses with a soft glow + fading tail
    pulses.forEach((pulse) => {
      const color = colors.accents[pulse.colorIdx];
      const TAIL = 5;
      for (let k = TAIL; k >= 0; k--) {
        const t = ((pulse.progress - k * 0.012) % 1 + 1) % 1;
        const pos = pointAt(pulse.trace, t);
        const alpha = (1 - k / TAIL) * 0.8;
        const r = k === 0 ? 3.2 : 1.6;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        if (k === 0) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgb(${color})`;
        }
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }

  function step(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    pulses.forEach((pulse) => {
      pulse.progress = (pulse.progress + pulse.speed * dt) % 1;
    });

    draw();
    if (!reducedMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mt:themechange', () => {
    colors = readColors();
  });

  resize();
  if (reducedMotion) {
    draw(); // single static frame, no animation
  } else {
    requestAnimationFrame(step);
  }
})();
