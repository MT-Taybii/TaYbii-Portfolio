/**
 * 
 * CONFIG — edit this once your backend (server/) is deployed.
 * Leave as '' to run purely on the localStorage fallback (no server).
 
 */
const API_BASE = "https://mt-taybii-api.onrender.com";

/* 
   Split text into per-character spans for the reveal animation
 */
function splitToChars(el) {
  const text = el.dataset.text || el.textContent;
  el.textContent = '';
  const frag = document.createDocumentFragment();
  [...text].forEach((ch) => {
    const span = document.createElement('span');
    span.className = 'char' + (ch === ' ' ? ' space' : '');
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    frag.appendChild(span);
  });
  el.appendChild(frag);
  return el.querySelectorAll('.char');
}

function animateChars(chars, startDelay = 0, stagger = 28) {
  chars.forEach((c, i) => {
    setTimeout(() => c.classList.add('animate-in'), startDelay + i * stagger);
  });
}

/* 
   View counter — tries the API, falls back to localStorage so the
   page still works before the backend in /server is deployed.
 */
async function bumpViewCounter() {
  const countEl = document.getElementById('viewCount');

  // Only count once per browser session (avoid refresh-spam inflating the count)
  const alreadyCountedThisSession = sessionStorage.getItem('mt_view_counted');

  if (API_BASE) {
    try {
      const endpoint = `${API_BASE}/api/views${alreadyCountedThisSession ? '' : '/increment'}`;
      const res = await fetch(endpoint, {
        method: alreadyCountedThisSession ? 'GET' : 'POST',
      });
      const data = await res.json();
      sessionStorage.setItem('mt_view_counted', '1');
      renderCount(countEl, data.views);
      return;
    } catch (err) {
      console.warn('View counter API unreachable, using local fallback.', err);
    }
  }

  //  localStorage fallback (per-browser, not global) 
  let views = parseInt(localStorage.getItem('mt_portfolio_views') || '0', 10);
  if (!alreadyCountedThisSession) {
    views += 1;
    localStorage.setItem('mt_portfolio_views', String(views));
    sessionStorage.setItem('mt_view_counted', '1');
  }
  renderCount(countEl, views);
}

function renderCount(el, value) {
  if (!el) return;
  el.textContent = value.toLocaleString();
  el.classList.remove('tick');
  void el.offsetWidth; // restart animation
  el.classList.add('tick');
}

/* 
   Master sequence:
   1) 3s loader (progress ring driven purely by CSS animation)
   2) "pro" panel-wipe transition (~0.85s)
   3) reveal main site
   4) within 0.5s: avatar rises + name/eyebrow characters animate in
   5) bump the view counter
 */
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const percentEl = document.getElementById('loaderPercent');
  const transition = document.getElementById('transition');
  const page1 = document.getElementById('page1');
  const avatarWrap = document.querySelector('.hero-avatar-wrap');
  const tagline = document.querySelector('.tagline');

  const eyebrowChars = splitToChars(document.getElementById('eyebrowText'));
  const nameChars = splitToChars(document.getElementById('nameText'));

  // Animate the 0% -> 100% readout in sync with the 3s ring animation
  const loadStart = performance.now();
  const LOAD_DURATION = 3000;
  function tickPercent(now) {
    const elapsed = now - loadStart;
    const pct = Math.min(100, Math.round((elapsed / LOAD_DURATION) * 100));
    percentEl.textContent = pct + '%';
    if (elapsed < LOAD_DURATION) requestAnimationFrame(tickPercent);
  }
  requestAnimationFrame(tickPercent);

  setTimeout(() => {
    // Step 1 -> 2: hide loader, run the panel-wipe "pro" transition
    loader.classList.add('hide');
    transition.classList.add('run');

    setTimeout(() => {
      // Step 3: reveal page 1 underneath the wipe
      page1.classList.add('reveal');

      setTimeout(() => {
        transition.classList.remove('run');
        transition.style.visibility = 'hidden';
      }, 900);

      // Step 4: avatar + text animate in within 0.5s of the page showing
      requestAnimationFrame(() => {
        avatarWrap.classList.add('animate-in'); // ~0.5s rise, per spec
        animateChars(eyebrowChars, 120, 22);
        animateChars(nameChars, 260, 26);
        setTimeout(() => tagline.classList.add('animate-in'), 500);
      });

      // Step 5: count this visit
      bumpViewCounter();
    }, 500); // let the first wipe panels start covering before we swap content
  }, LOAD_DURATION);
});
