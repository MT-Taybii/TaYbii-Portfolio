/**
 * Renders 8 app-launcher boxes from window.PORTFOLIO_PROJECTS (js/projects.js)
 * and wires up the click behavior:
 *   - filled slot  -> bubble-evaporate burst, then opens its own url in a new tab
 *   - empty slot   -> bubble burst only, brief "empty" pulse, no navigation
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

  projects.forEach((project, i) => {
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
    grid.appendChild(box);

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
