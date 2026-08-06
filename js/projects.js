/**
 * =====================================================================
 * PROJECT LAUNCHER CONFIG — the ONLY file you edit to manage the 8 boxes.
 * There is no in-page editing UI on purpose, so nobody but you (editing
 * this file directly) can add, rename, or relink a box.
 * =====================================================================
 *
 * Each of the 8 slots below maps 1:1 to a box in the grid (4 up, 4 down,
 * left to right, top row first). Leave a slot exactly as `null` to keep
 * it empty — it renders as a dashed "+" placeholder and does nothing
 * when clicked.
 *
 * To wire up a real project:
 *   1. Duplicate the folder  projects/_template/  →  projects/your-project-name/
 *      (it already has its own index.html, style.css, script.js, plus a
 *      server/ with its own Express + MongoDB + Node files — fully
 *      separate from every other project and from this portfolio).
 *   2. Drop that project's logo.png inside that same folder.
 *   3. Fill in one slot below:
 *
 *      {
 *        name: 'Weather App',                              // shown under the icon, your choice
 *        logo: 'projects/weather-app/logo.png',             // 48x48-ish PNG, square
 *        url:  'projects/weather-app/index.html',           // or a deployed URL once it's live
 *      }
 *
 *   Clicking the box opens `url` in a new tab — exactly like hitting
 *   "Go Live" on that project's own server, separate from this one.
 */
window.PORTFOLIO_PROJECTS = [
  null, // box 1
  null, // box 2
  null, // box 3
  null, // box 4
  null, // box 5
  null, // box 6
  null, // box 7
  null, // box 8
];
