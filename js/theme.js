/**
 * Theme is set as early as possible via the inline script in <head>
 * (so there's no flash of the wrong theme). This file only wires up
 * the toggle button and keeps localStorage + other scripts in sync.
 */
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('mt_theme', theme);
    btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    // Let other modules (e.g. the page 2 canvas background) react to the swap
    window.dispatchEvent(new CustomEvent('mt:themechange', { detail: { theme } }));
  }

  btn.addEventListener('click', () => {
    applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
  });

  // Keep in sync if the OS-level scheme changes and the user hasn't chosen manually
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (localStorage.getItem('mt_theme')) return; // user has an explicit preference, don't override
    applyTheme(e.matches ? 'light' : 'dark');
  });

  btn.setAttribute('aria-pressed', currentTheme() === 'light' ? 'true' : 'false');
})();
