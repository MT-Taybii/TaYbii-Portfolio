/**
 * Renders 8 app-launcher boxes from window.PORTFOLIO_PROJECTS (js/projects.js)
 * and wires up the click behavior:
 *   - filled slot  -> bubble-evaporate burst, then opens its own url in a new tab
 *   - empty slot   -> bubble burst only, brief "empty" pulse, no navigation
 *   - optional `github` field on a project adds a small GitHub badge in the
 *     corner that opens the repo directly, independent of the main click
 */
(function () {
  const grid = document.getElementById('appsGrid');
  if (!grid) return;

  const SLOT_COUNT = 8;
  const projects = (window.PORTFOLIO_PROJECTS || []).slice(0, SLOT_COUNT);
  while (projects.length < SLOT_COUNT) projects.push(null);

  const plusIconSVG = `
    <svg class="plus" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;

  const githubIconSVG = `
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55
        0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7
        1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7
        0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0
        c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.12 3.06.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.4-5.25 5.69
        .41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12
        C23.5 5.73 18.27.5 12 .5Z"/>
    </svg>`;

  projects.forEach((project, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'app-box-wrap';

    const box = document.createElement('button');
    box.type = 'button';
    box.className = 'app-box';
    box.setAttribute('role', 'listitem');
    box.setAttribute('aria-label', project?.name ? `Open ${project.name}` : `Empty project slot ${i + 1}`);

    const icon = document.createElement('span');
    icon.className = 'app-icon' + (project ? '' : ' is-empty');

    if (project?.logo) {
      const img = document.createElement('img');
      img.src = project.logo;
      img.alt = ''; // decorative — the box's aria-label already names it
      img.loading = 'lazy';
      icon.appendChild(img);
    } else {
      icon.innerHTML = plusIconSVG;
    }

    const name = document.createElement('span');
    name.className = 'app-name';
    name.textContent = project?.name || '\u2014'; // em dash for empty slots

    box.appendChild(icon);
    box.appendChild(name);
    wrap.appendChild(box);

    if (project?.github) {
      const gh = document.createElement('a');
      gh.className = 'app-github';
      gh.href = project.github;
      gh.target = '_blank';
      gh.rel = 'noopener';
      gh.setAttribute('aria-label', `${project.name || 'Project'} on GitHub`);
      gh.innerHTML = githubIconSVG;
      wrap.appendChild(gh);
    }

    grid.appendChild(wrap);

    box.addEventListener('click', (e) => burstAndLaunch(e, box, project));
  });

  function burstAndLaunch(e, box, project) {
    spawnBubbles(e.clientX, e.clientY);

    if (project?.url) {
      // small delay so the bubble burst is visible before the tab swap
      setTimeout(() => window.open(project.url, '_blank', 'noopener'), 180);
    } else {
      box.classList.add('app-box--empty-pulse');
      setTimeout(() => box.classList.remove('app-box--empty-pulse'), 400);
    }
  }

  function spawnBubbles(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('span');
      bubble.className = 'bubble';
      const angle = Math.random() * Math.PI * 2;
      const dist = 24 + Math.random() * 46;
      bubble.style.left = x + 'px';
      bubble.style.top = y + 'px';
      bubble.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
      bubble.style.setProperty('--by', Math.sin(angle) * dist + 'px');
      bubble.style.setProperty('--bubble-size', 4 + Math.random() * 5 + 'px');
      bubble.style.width = bubble.style.height = 'var(--bubble-size)';
      document.body.appendChild(bubble);
      bubble.addEventListener('animationend', () => bubble.remove());
    }
  }
})();
