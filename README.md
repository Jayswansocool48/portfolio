# portfolio

The Iron Lantern Studios website. Plain HTML, CSS and JavaScript with no build step.

Pages: `index.html` (home), `games.html`, `store.html`, `about.html`, `contact.html`, plus `privacy.html`, `terms.html` and `refunds.html`. Each page carries its own copy of the header and footer, so change the nav in every page if you add one.

## Add or change a game or asset

Edit `projects.js`. `GAMES` and `ASSETS` hold every entry, and the comments above each list explain the fields. Set `show: false` to hide one. Put covers, screenshots and trailers in `media/`. A game's `cover` and `trailer` fields point at those files, and a placeholder shows until each file exists.

To put an asset on sale, add `price` and `buy: { label, href }` pointing at its itch.io, Fab or Roblox Creator Store page.

Your email, Discord and social links sit in `STUDIO` at the top of the same file. Social links stay hidden until you fill them in.

## Preview

Run `python3 -m http.server` in this folder and open `localhost:8000`. Opening `index.html` straight from disk blocks the fonts.

## Go live

1. Finish `COMPLIANCE.md`.
2. Make the repo public.
3. Turn on GitHub Pages: Settings > Pages > Deploy from branch > `main`, root.
4. Remove the `noindex` meta tag from each page when you want search engines to list the site.
