# Compliance

Status for the Iron Lantern Studios site. "N/A" means the site has nothing the rule applies to. Revisit any N/A line before you add accounts, a newsletter, analytics or subscriptions.

| # | Item | Status |
|---|------|--------|
| 1 | Privacy policy | Done: `/privacy`, linked in every footer. |
| 2 | Terms of service | Done: `/terms`, linked in every footer. |
| 3 | Refund policy | Done: `/refunds` covers buying here and buying on other stores. Linked from the store, every product page with a "Buy here" option, and every footer. Review it before the first sale. |
| 4 | Cookie policy | Done: the privacy policy states the site sets no cookies and stores nothing in the browser. |
| 5 | Cookie consent banner | N/A: no cookies, no browser storage, no tracking. |
| 6 | Checkbox consents on forms | Done: the Contact form needs a ticked consent box before it opens your email app. |
| 7 | Collect no unnecessary data | Done: no analytics or accounts. The site collects nothing; the checkout provider collects only what a sale needs. |
| 8 | Audit third-party SDKs | Done: Astro, React, Motion, Lenis, cmdk, Three.js and Phosphor Icons, all bundled into the site at build time. No CDN requests. Buy buttons are plain links to the store or hosted checkout. |
| 9 | Remove dark patterns | Done: no popups, countdowns or pre-checked boxes. |
| 10 | Remove hidden fees | Done: prices show on the button once set; the terms say tax appears on the checkout page before you pay. |
| 11 | Remove fake reviews | Done: no reviews, ratings or testimonials. |
| 12 | Remove unsupported claims | Done: every game and asset shows its real status; unreleased stores show as "Planned"; the About numbers count the catalog. |
| 13 | Alt text for accessibility | Done: covers say "Cover art for" the name, title-card placeholders have labels, the 3D views describe the model and controls, and `catalog.ts` takes alt text for every screenshot. |
| 14 | Fix color contrast | Done on the background: body text 15.3:1, muted text 6.6:1, red text and links 5.4:1, button text on crimson 5.0:1. Crimson fills and focus rings clear the 3:1 non-text minimum. |
| 15 | Full keyboard navigation | Done: skip link, visible focus ring on every control, Ctrl+K search with arrow keys, arrow keys in filter chips, the Now building carousel and a focused 3D view, Esc closes search and the phone menu. |
| 16 | Add business details | Done: studio name in every footer, email and Discord on the Contact page. |
| 17 | Age consent for kids' data | N/A: the site collects no data from anyone. |
| 18 | Unsubscribe link in emails | N/A: the site sends no email. |
| 19 | License every font and image | Done: fonts under SIL OFL 1.1, code libraries under MIT, credited on `/terms` and in the README. The 3D models are built in code for this site. No third-party images. |
| 20 | Data deletion requests | Done: the privacy policy explains how to ask, with a 30-day answer. |

## Legal holes

| Item | Status |
|------|--------|
| Self-hosted fonts and scripts | Done: Fontsource packages and every library ship in the build. Nothing loads from another server. |
| No keystroke or session-replay capture | Done: no analytics or replay tools. |
| Age check on sign-up | N/A: no sign-up. |
| Postal address and one-click unsubscribe in email | N/A: no email. Add both before any newsletter or launch email. |
| Renewal terms beside the buy button | N/A: every price is one-time, and the store page says so beside the buttons. |
| Upload disclaimer | N/A: no uploads. |

## Motion

Every animation is a spring (`src/lib/springs.ts`): headline words rising, sections and cards rising in turn, the About numbers counting up, the Now building carousel (drag or flick to switch), filter chips and the card grid rearranging, tilting cards, search, the phone menu, and the 3D views' tilt and zoom. A flicked 3D model coasts on friction back to its idle spin. Page transitions use the same spring sampled into a CSS `linear()` curve. Reduced-motion settings turn every animation off.

## UX patterns

In: command menu (Ctrl+K), shortcut hints, pre-rendering (prefetch on hover), view transitions between pages with covers morphing into product heroes, interruptible animations, 44 px hit targets, safe area insets, tabular numbers, balanced headlines, continuous corners.

Skipped, nothing to apply them to: skeleton loaders (content ships with the page), optimistic updates, undo toasts, stale-while-revalidate, sheets (product details are full pages now), predictive back, one-time codes, idempotency keys (checkout runs on the provider's page), safe triangle menus.
