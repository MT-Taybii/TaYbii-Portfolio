/**
 * Site-wide navigation: powers the navbar links, the mobile sidebar, the
 * footer's page links, and the search bar (both the navbar's copy and the
 * sidebar's copy).
 *
 * Runs after js/projects.js, js/album-photos.js, js/apps-grid.js,
 * js/tech-marquee.js, and js/page-transitions.js — it reads data those
 * scripts expose (window.PORTFOLIO_PROJECTS, window.ALBUM_PHOTOS, the
 * rendered tech-logo alt text, and window.MT_SLIDE_FRACTION).
 */
(function () {
  const PAGES = [
    { id: 'track1', label: 'Home' },
    { id: 'track2', label: 'Projects' },
    { id: 'track3', label: 'Tech Stack' },
    { id: 'track4', label: 'Album' },
  ];

  /* ==================================================================
     1) SCROLL-TO-PAGE — shared by navbar links, sidebar links, footer links
     ================================================================== */
  function scrollToTrack(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;

    if (trackId === 'track1' || !track.classList.contains('track-slide')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const slideFraction = window.MT_SLIDE_FRACTION || 0.6;
    const scrollableRange = track.offsetHeight - window.innerHeight;
    // land a little past where the slide-in finishes, so the page is
    // fully settled rather than mid-slide
    const target = track.offsetTop + scrollableRange * slideFraction + 60;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-target]').forEach((el) => {
    el.addEventListener('click', () => {
      scrollToTrack(el.dataset.target);
      closeSidebar();
    });
  });

  /* ==================================================================
     2) ACTIVE-LINK HIGHLIGHT — mirrors page-transitions.js's own math
     ================================================================== */
  const navLinkEls = Array.from(document.querySelectorAll('[data-target]'));

  function updateActiveLink() {
    const slideFraction = window.MT_SLIDE_FRACTION || 0.6;
    let current = 'track1';

    PAGES.forEach((page) => {
      const track = document.getElementById(page.id);
      if (!track) return;
      if (!track.classList.contains('track-slide')) {
        if (window.scrollY < track.offsetHeight * 0.5) current = page.id;
        return;
      }
      const scrollableRange = Math.max(1, track.offsetHeight - window.innerHeight);
      const progress = (window.scrollY - track.offsetTop) / scrollableRange;
      const slideProgress = Math.min(1, Math.max(0, progress / slideFraction));
      if (slideProgress > 0.5) current = page.id;
    });

    navLinkEls.forEach((el) => {
      el.classList.toggle('is-active', el.dataset.target === current);
    });
  }

  let activeTicking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!activeTicking) {
        requestAnimationFrame(() => {
          updateActiveLink();
          activeTicking = false;
        });
        activeTicking = true;
      }
    },
    { passive: true }
  );
  updateActiveLink();

  /* ==================================================================
     3) SIDEBAR — hamburger toggle, backdrop click, Escape to close
     ================================================================== */
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebarClose = document.getElementById('sidebarClose');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    backdrop?.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
    hamburger?.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    backdrop?.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    hamburger?.setAttribute('aria-expanded', 'false');
  }

  hamburger?.addEventListener('click', () => {
    sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  sidebarClose?.addEventListener('click', closeSidebar);
  backdrop?.addEventListener('click', closeSidebar);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar?.classList.contains('open')) closeSidebar();
  });

  /* 
     4) SEARCH — built from live site data, no separate content file to
        keep in sync: pages are static, everything else is read from
        what the other scripts already rendered/exposed.
      */
  function buildSearchIndex() {
    const index = PAGES.map((p) => ({ label: p.label, sub: 'Page', trackId: p.id }));

    (window.PORTFOLIO_PROJECTS || []).forEach((project) => {
      if (project?.name) {
        index.push({ label: project.name, sub: 'Project', trackId: 'track2', projectName: project.name });
      }
    });

    const seenTech = new Set();
    document.querySelectorAll('#marqueeGroup .marquee__item img').forEach((img) => {
      const label = img.alt;
      if (label && !seenTech.has(label)) {
        seenTech.add(label);
        index.push({ label, sub: 'Tech Stack', trackId: 'track3' });
      }
    });

    (window.ALBUM_PHOTOS || []).forEach((photo) => {
      if (photo?.caption) {
        index.push({ label: photo.caption, sub: 'Album', trackId: 'track4' });
      }
    });

    return index;
  }

  function highlightProjectBox(name) {
    const box = Array.from(document.querySelectorAll('.app-box')).find(
      (b) => b.getAttribute('aria-label') === `Open ${name}`
    );
    if (!box) return;
    box.classList.add('app-box--search-hit');
    setTimeout(() => box.classList.remove('app-box--search-hit'), 1600);
  }

  function wireSearch(inputEl, resultsEl) {
    if (!inputEl || !resultsEl) return;
    let index = null; // built lazily on first focus, so it always reflects current data

    function showResults(query) {
      if (!index) index = buildSearchIndex();
      const q = query.trim().toLowerCase();
      resultsEl.innerHTML = '';

      if (!q) {
        resultsEl.hidden = true;
        return;
      }

      const matches = index.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);

      if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'search-result search-result--empty';
        empty.textContent = 'No matches';
        resultsEl.appendChild(empty);
        resultsEl.hidden = false;
        return;
      }

      matches.forEach((item) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'search-result';
        row.setAttribute('role', 'option');
        row.innerHTML = `<span class="search-result-label">${escapeHTML(item.label)}</span><span class="search-result-sub">${item.sub}</span>`;
        row.addEventListener('click', () => {
          scrollToTrack(item.trackId);
          if (item.projectName) setTimeout(() => highlightProjectBox(item.projectName), 500);
          inputEl.value = '';
          resultsEl.hidden = true;
          closeSidebar();
        });
        resultsEl.appendChild(row);
      });

      resultsEl.hidden = false;
    }

    inputEl.addEventListener('input', () => showResults(inputEl.value));
    inputEl.addEventListener('focus', () => {
      index = buildSearchIndex(); // refresh in case data changed since last build
      if (inputEl.value) showResults(inputEl.value);
    });
    document.addEventListener('click', (e) => {
      if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) resultsEl.hidden = true;
    });
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        resultsEl.hidden = true;
        inputEl.blur();
      }
    });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  wireSearch(document.getElementById('navSearchInput'), document.getElementById('navSearchResults'));
  wireSearch(document.getElementById('sidebarSearchInput'), document.getElementById('sidebarSearchResults'));

  /* 
     5) FOOTER YEAR
      */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
