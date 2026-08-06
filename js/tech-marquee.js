/**
 * Page 3 tech-stack marquees.
 *
 * - Each .marquee__track's items are cloned once so the CSS keyframe
 *   (0% -> -50%) loops seamlessly regardless of how many logos are in it.
 * - A single rAF loop scales every .marquee__item based on how close its
 *   center is to the horizontal middle of the screen: small near the
 *   edges, growing as it approaches the middle, shrinking back down as
 *   it exits — the "zoom in passing through, ease back to normal" effect.
 */
(function () {
  const group = document.getElementById('marqueeGroup');
  if (!group) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) duplicate each track's children once, for a seamless loop
  const tracks = Array.from(group.querySelectorAll('.marquee__track'));
  tracks.forEach((track) => {
    const originals = Array.from(track.children);
    originals.forEach((el) => track.appendChild(el.cloneNode(true)));
  });

  if (reducedMotion) return; // keep items static at rest, no scroll/zoom loop

  // 2) zoom-near-center effect
  const items = Array.from(group.querySelectorAll('.marquee__item'));
  const PEAK_SCALE = 1.45;
  const FALLOFF_RATIO = 0.22; // fraction of viewport width used as the "zoom zone" radius

  function tick() {
    const centerX = window.innerWidth / 2;
    const radius = Math.max(160, window.innerWidth * FALLOFF_RATIO);

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const dist = Math.abs(itemCenterX - centerX);
      const t = Math.max(0, 1 - dist / radius); // 0 at the edges, 1 dead-center
      const eased = t * t; // ease-in toward the peak for a smoother zoom
      const scale = 1 + eased * (PEAK_SCALE - 1);
      item.style.transform = `scale(${scale.toFixed(3)})`;
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
