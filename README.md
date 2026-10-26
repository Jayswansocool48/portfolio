# portfolio

The Iron Lantern Studios website. Plain HTML, CSS and JavaScript with no build step.

## Add or change a project

Edit `projects.js`. Each entry is one project. Set `show: false` to hide one. Put screenshots in a `media/` folder and list them under `images`.

Set `STUDIO.email` at the top of the same file to show a contact address in the footer.

## Preview

Run `python3 -m http.server` in this folder and open `localhost:8000`. Opening `index.html` straight from disk blocks the fonts.

## Go live

1. Finish `COMPLIANCE.md`.
2. Make the repo public.
3. Turn on GitHub Pages: Settings > Pages > Deploy from branch > `main`, root.
4. Remove the `noindex` meta tag from each page when you want search engines to list the site.
