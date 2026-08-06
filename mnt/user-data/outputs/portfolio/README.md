# Muhammad Tayyab — Portfolio

## What's here
```
index.html                  page 1 (loader/hero) + page 2 (app launcher), stacked
css/style.css                 all styling — tokens (incl. dark/light theme) at the top
js/jelly-background.js        cursor-follow physics for page 1's jelly blobs
js/script.js                  loader/transition/reveal sequencing + view counter
js/theme.js                   dark/light mode toggle (site-wide, persisted)
js/page-transitions.js        scroll-linked "paper page" slide mechanic
js/page2-background.js        page 2's ambient canvas background
js/projects.js                *** the only file you edit to manage the 8 app boxes ***
js/apps-grid.js               renders the 8 boxes + bubble-evaporate click effect
assets/profile.png            PLACEHOLDER avatar — replace with your real photo
projects/_template/           duplicate this per project you add to a box (own HTML/CSS/JS/Express/MongoDB)
server/                       optional Node + MongoDB backend for a real, global view count
```

## Run it right now
No build step. Just open `index.html` in a browser, or serve the folder:
```bash
npx serve .
```
Scroll down past the hero — page 2 (the app launcher) slides in from the left
and pins in place, "paper over paper."

## Adding a project to one of the 8 boxes
1. `cp -r projects/_template projects/your-project-name` and build the real
   site there (it has its own index.html/css/js, and its own Express +
   MongoDB backend in `server/` — fully separate from this portfolio and
   from every other project).
2. Drop the project's logo in as `logo.png` in that same folder.
3. Open `js/projects.js` and fill in one of the 8 `null` slots with
   `{ name, logo, url }`. That file is the *only* place box names/links are
   editable — there's deliberately no in-page UI for it.
4. Clicking the box in the browser opens `url` in a new tab, same as hitting
   "Go Live" on that project.

## Turning on the real (global) view counter
1. Create a free MongoDB Atlas cluster → get a connection string.
2. `cd server && npm install`
3. Copy `.env.example` to `.env` and fill in `MONGODB_URI`.
4. `npm start` (runs locally on port 3000), or deploy `server/` to Render/Railway/Fly.io.
5. In `js/script.js`, set `API_BASE` to your deployed server's URL.
6. Set `ALLOWED_ORIGIN` in `.env` to your live site's domain.

## Dark / light mode
The toggle button in the top bar flips `data-theme` on `<html>` and saves the
choice to `localStorage`, so it's consistent across every page. Both themes'
color tokens live at the top of `css/style.css`. The page-2 canvas background
re-reads its colors automatically on toggle.

## Replacing the placeholder photo
Swap `assets/profile.png` for your own PNG (transparent background works best).

## Customizing the jelly blob colors (page 1)
Six blob colors + their "viscosity" (follow speed) live at the top of
`css/style.css` under `:root`, and each blob's speed is set via
`data-viscosity` on the element in `index.html` (lower = thicker/slower).

## Roadmap / not done yet
Covered so far: loading sequence, transition animation, animated hero, jelly
background, view counter (MongoDB-backed), page 2 with the sticky-paper
scroll mechanic, 8-box app launcher (jelly hover + bubble-evaporate click),
page 2 ambient background, site-wide dark/light mode, full responsiveness.
Flagged for later, per your note this keeps growing:
- The 8 real projects themselves (boxes are wired up but empty until you fill `js/projects.js`)
- About / skills / contact sections, likely as page 3
- SEO meta tags, Open Graph image, favicon
- Real analytics beyond a raw view count (unique visitors, referrers)

Send over content/sections whenever you're ready and I'll build them into
this same structure.
