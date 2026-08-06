/**
 * Jelly / goo background.
 * Each blob has its own "viscosity" (data-viscosity, 0-1: lower = thicker/slower).
 * On pointer move, blobs ease toward the pointer at their own rate, combined
 * with a base drift so the field still feels alive when idle.
 * On touch devices we skip pointer-follow and keep only ambient CSS drift.
 */
(function () {
  const field = document.getElementById('jellyField');
  if (!field) return;

  const light = document.getElementById('lightFollow');

  const isTouch = window.matchMedia('(hover: none)').matches;
  const blobs = Array.from(field.querySelectorAll('.blob')).map((el) => ({
    el,
    viscosity: parseFloat(el.dataset.viscosity) || 0.08,
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
  }));

  if (isTouch) return; // ambient CSS keyframes already handle this case

  let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let hasPointer = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      hasPointer = true;

      // spotlight follow: set the radial-gradient center directly (no lerp —
      // this one should feel snappy/precise, unlike the slow gooey blobs)
      if (light) {
        light.style.setProperty('--mx', `${e.clientX}px`);
        light.style.setProperty('--my', `${e.clientY}px`);
        light.classList.add('active');
      }
    },
    { passive: true }
  );

  window.addEventListener('pointerleave', () => {
    hasPointer = false;
    if (light) light.classList.remove('active');
  });

  function frame() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    blobs.forEach((b) => {
      // pull toward pointer (scaled) when active, otherwise relax to center
      const targetX = hasPointer ? (pointer.x - cx) * 0.35 : 0;
      const targetY = hasPointer ? (pointer.y - cy) * 0.35 : 0;

      b.tx = targetX;
      b.ty = targetY;

      // spring/lerp: viscosity controls how quickly each blob "catches up"
      b.x += (b.tx - b.x) * b.viscosity;
      b.y += (b.ty - b.y) * b.viscosity;

      b.el.style.transform = `translate(-50%, -50%) translate(${b.x}px, ${b.y}px)`;
    });

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
