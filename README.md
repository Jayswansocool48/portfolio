# portfolio

The Iron Lantern Studios website. Plain HTML, CSS and JavaScript with no build step.

## Add or change a game or asset

Edit `projects.js`. Each entry is a game or an asset. Set `show: false` to hide one. Put screenshots in a `media/` folder and list them under `images`. Add a `price` and a `links` entry when an asset goes on sale.

The email and Discord shown under Contact sit at the top of the same file.

## Preview

Run `python3 -m http.server` in this folder and open `localhost:8000`. Opening `index.html` straight from disk blocks the fonts.

## Go live

1. Finish `COMPLIANCE.md`.
2. Make the repo public.
3. Turn on GitHub Pages: Settings > Pages > Deploy from branch > `main`, root.
4. Remove the `noindex` meta tag from each page when you want search engines to list the site.
