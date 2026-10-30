# portfolio

The Iron Lantern Studios website: games, a 3D asset store, and how to get in touch. Built with Astro, Tailwind CSS and React islands, with Three.js for the PSX-style 3D views.

## Run it

You need Node 20 or newer.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
```

## Change the content

Everything the site shows lives in `src/data/catalog.ts`: your contact details, every game and every asset. Each page builds from that file.

- **Covers, screenshots and trailers** go in `public/media/`. Point a game's `cover` or `trailer` at the file. Until the file exists, the site shows a title-card cover in the game's tint.
- **Where to buy or play** is each entry's `get` list. Paste the store page into `url` and that store becomes a live button; the first live one becomes the page's main button. Empty `url`s show as "Planned".
- **Your own checkout:** paste a hosted checkout link (Lemon Squeezy, Stripe Payment Links, or an itch.io page) into a `site` entry, and put the provider's name in `STUDIO.checkoutProvider`.
- **3D models:** export a `.glb` from Blender into `public/media/` and set the asset's `model`. The asset page opens it in the 3D inspector with the PSX look. `standIn` shows a built-in low-poly stand-in until then.

## Publish

Pushing never publishes. To put the site on GitHub Pages:

1. In the repo, open Settings > Pages and set Source to **GitHub Actions**.
2. Open Actions > **Deploy** > **Run workflow**.

The site then lives at `https://jayswansocool48.github.io/portfolio/`. Remove `<meta name="robots" content="noindex, nofollow">` from `src/layouts/Base.astro` when you want search engines to list it.

On Cloudflare Pages or Vercel, use `npm run build` with output folder `dist` and leave `BASE_PATH` unset.

## Design

- **Theme:** "Red Dark" by kartman.sms on 21st.dev, dark variant: cool slate-charcoal surfaces with a blood-crimson accent. The crimson is split into a deep fill shade for buttons and a lighter shade for text, so both pass WCAG AA. Tokens live in `src/styles/global.css`.
- **Components:** the tilting cards adapt "Tilt Card" by tom_ui on 21st.dev. Search uses cmdk, the library behind shadcn/ui's Command. Icons are Phosphor.
- **Fonts:** Big Shoulders Display, Plus Jakarta Sans and Fira Code, self-hosted through Fontsource (SIL OFL 1.1).
- **Motion:** every animation is a spring, with presets in `src/lib/springs.ts`. Reduced-motion settings turn them off.

## Layout

```
src/
  data/catalog.ts       games, assets, stores, contact details
  pages/                one file per page; games/[id] and store/[id] build a page per entry
  components/           Astro and React pieces (Viewport, NowBuilding, Browser, CommandMenu, ...)
  lib/psx.js            the PS1-style Three.js renderer
  styles/global.css     theme tokens and base styles
public/media/           covers, screenshots, trailers, models
```
