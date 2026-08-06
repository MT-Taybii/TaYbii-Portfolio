/**
 * Page 4 (Research/Profile).
 *
 * 1) The whole "stage" (photo + brackets + tags + connectors) is built at
 *    a fixed 860x800 design size so all the connector-line geometry in
 *    index.html can stay simple, exact pixel coordinates. This script's
 *    only job for layout is scaling that whole stage down to fit whatever
 *    screen it's on — the internal geometry never needs recalculating.
 *    (Below 640px CSS takes over with a simpler stacked layout instead —
 *    see the matching media query in style.css — so this script backs off.)
 * 2) Mouse-parallax 3D tilt on the portrait itself.
 * 3) Reveal brackets/tags/connectors the first time the page scrolls into view.
 */
(function () {
  const DESIGN_W = 860;
  const DESIGN_H = 800;
  const MOBILE_BREAKPOINT = 640;

  const outer = document.getElementById('researchStageOuter');
  const stage = document.getElementById('researchStage');
  const tilt = document.getElementById('researchTilt');

  /* ---------------- responsive scale-to-fit ---------------- */
  function fitStage() {
    if (!outer || !stage) return;

    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      // CSS media query switches to a stacked layout at this width
      stage.style.transform = '';
      outer.style.height = '';
      return;
    }

    const availableWidth = outer.clientWidth;
    const scale = Math.min(1, availableWidth / DESIGN_W);
    stage.style.transform = `scale(${scale})`;
    outer.style.height = `${DESIGN_H * scale}px`;
  }

  window.addEventListener('resize', fitStage, { passive: true });
  fitStage();

  /* ---------------- mouse-parallax tilt ---------------- */
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (tilt && !isTouch) {
    const MAX_TILT = 14; // degrees

    tilt.addEventListener('pointermove', (e) => {
      const rect = tilt.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - py) * MAX_TILT;
      const rotateY = (px - 0.5) * MAX_TILT;
      tilt.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    tilt.addEventListener('pointerleave', () => {
      tilt.style.transform = '';
    });
  }

  /* ---------------- reveal on scroll into view ---------------- */
  if (stage && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) stage.classList.add('active');
        });
      },
      { threshold: 0.35 }
    );
    io.observe(stage);
  } else if (stage) {
    stage.classList.add('active'); // fallback: just show it
  }
})();
