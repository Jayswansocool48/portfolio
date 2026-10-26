# portfolio

The Iron Lantern Studios website. Plain HTML, CSS and JavaScript with no build step.

Pages: `index.html` (home), `games.html`, `store.html`, `about.html`, `contact.html`, plus `privacy.html`, `terms.html` and `refunds.html`. Each page carries its own copy of the header and footer, so change the nav in every page if you add one.

## Add or change a game or asset

Edit `projects.js`. `GAMES` and `ASSETS` hold every entry, and the comments above each list explain the fields. Set `show: false` to hide one. Put covers, screenshots and trailers in `media/`. A game's `cover` and `trailer` fields point at those files, and a placeholder shows until each file exists.

Each game and asset has a `get` list of where people can buy or play it: `site` (your own checkout), `steam`, `itch`, `google-play`, `app-store`, `browser`, `roblox`, `roblox-store`, `fab` or `unity-store`. Paste the store page into `url` and the button goes live; an empty `url` shows "Coming soon". Add `price` to show it on the button.

For `site`, paste the hosted checkout link from your payment provider (a Lemon Squeezy product link or a Stripe Payment Link, say) and put the provider's name in `STUDIO.checkoutProvider`.

Your email, Discord and social links sit in `STUDIO` at the top of the same file. Social links stay hidden until you fill them in.

## Preview

Run `python3 -m http.server` in this folder and open `localhost:8000`. Opening `index.html` straight from disk blocks the fonts.

## Go live

1. Finish `COMPLIANCE.md`.
2. Make the repo public.
3. Turn on GitHub Pages: Settings > Pages > Deploy from branch > `main`, root.
4. Remove the `noindex` meta tag from each page when you want search engines to list the site.
