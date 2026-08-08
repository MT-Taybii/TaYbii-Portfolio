/**
 * "Real paper" scroll mechanic.
 *
 * Each <section class="page-track track-slide"> owns extra scroll height
 * (220vh in CSS). Its sticky .page-panel pins to the viewport and, as the
 * user scrolls through that track, this script slides the panel in from
 * translateX(-100%) to 0 over the first SLIDE_FRACTION of the track's
 * scrollable range, then holds it in place (fully covering the page
 * beneath) for the remainder — like a paper sheet being dragged over the
 * one before it and left sitting there.
 *
 * To add page 3, 4, etc. later: wrap it the same way
 * (`<section class="page-track track-slide"><div class="page-panel" ...>`)
 * — this script picks up any matching section automatically, no edits needed.
 */
(function () {
  const SLIDE_FRACTION = 0.6; // fraction of the track's scroll range spent sliding, rest is "hold"
  window.MT_SLIDE_FRACTION = SLIDE_FRACTION; // shared with js/site-nav.js for scroll-to-page targets

  const tracks = Array.from(document.querySelectorAll('.page-track.track-slide'));
  if (!tracks.length) return;

  const items = tracks.map((track) => ({
    track,
    panel: track.querySelector('.page-panel'),
  })).filter((item) => item.panel);

  let ticking = false;

  function update() {
    const vh = window.innerHeight;

    items.forEach(({ track, panel }) => {
      const trackTop = track.offsetTop;
      const scrollableRange = Math.max(1, track.offsetHeight - vh);
      const raw = (window.scrollY - trackTop) / scrollableRange;
      const progress = Math.min(1, Math.max(0, raw));
      const slideProgress = Math.min(1, progress / SLIDE_FRACTION);

      const translateX = 0 + slideProgress * 100; // -100% -> 0%
      panel.style.transform = `translateX(${translateX}%)`;
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
