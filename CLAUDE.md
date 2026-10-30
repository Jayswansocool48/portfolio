# Iron Lantern Studios site

- Astro 7 static site, Tailwind CSS 4, React islands, Three.js. `npm run build` must pass before any commit.
- Content lives only in `src/data/catalog.ts`. Media goes in `public/media/`.
- All internal links go through `href()` from `src/lib/utils.ts` so the `/portfolio` base path works on GitHub Pages.
- Theme tokens are in `src/styles/global.css` (from 21st.dev "Emerald Dark"). Dark only. No orange or cream, no scrollbars.
- Motion uses the spring presets in `src/lib/springs.ts`. No CSS easing curves.
- Deploy is manual (Actions > Deploy). Never make pushes publish automatically.
