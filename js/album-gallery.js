/**
 * Page 4 — achievements/memories album.
 * Renders cards from window.ALBUM_PHOTOS (js/album-photos.js), reveals
 * them staggered the first time the page scrolls into view, and opens
 * a lightbox on click.
 */
(function () {
  const grid = document.getElementById('albumGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  if (!grid) return;

  const photos = window.ALBUM_PHOTOS || [];

  photos.forEach((photo, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'album-card';
    card.style.transitionDelay = `${Math.min(i, 10) * 45}ms`;
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', photo.caption || `Photo ${i + 1}`);

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.caption || '';
    img.loading = 'lazy';

    const caption = document.createElement('span');
    caption.className = 'album-caption';
    caption.textContent = photo.caption || '';

    card.appendChild(img);
    card.appendChild(caption);
    grid.appendChild(card);

    card.addEventListener('click', () => openLightbox(photo));
  });

  /* reveal on scroll into view  */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) grid.classList.add('active');
        });
      },
      { threshold: 0.2 }
    );
    io.observe(grid);
  } else {
    grid.classList.add('active');
  }

  /* lightbox */
  function openLightbox(photo) {
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.caption || '';
    lightboxCaption.textContent = photo.caption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  if (lightbox && lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox(); // click on the dark backdrop
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }
})();
