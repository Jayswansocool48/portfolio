# Compliance

Status for the Iron Lantern Studios site. "N/A" means the site has nothing the rule applies to. Revisit any N/A line before you add forms, sales, email or analytics.

| # | Item | Status |
|---|------|--------|
| 1 | Privacy policy | Done: `privacy.html`, linked in every footer. |
| 2 | Terms of service | Done: `terms.html`, linked in every footer. |
| 3 | Refund policy | Done: `refunds.html`, linked from the store and every footer. Review it before the first sale. |
| 4 | Cookie policy | Done: the privacy policy states the site sets no cookies and explains the stored theme choice. |
| 5 | Cookie consent banner | N/A: no cookies, no tracking. The stored theme choice is a strictly necessary preference. |
| 6 | Checkbox consents on forms | Done: the Contact form needs a ticked consent box before it opens your email app. |
| 7 | Collect no unnecessary data | Done: no analytics, no accounts, no third-party requests. |
| 8 | Audit third-party SDKs | Done: Lenis (smooth scrolling, MIT) is the only library, self-hosted in `vendor/`. Fonts are self-hosted in `fonts/`. No CDN requests. |
| 9 | Remove dark patterns | Done: no popups, no countdowns, no pre-checked boxes. |
| 10 | Remove hidden fees | Done: prices show in full on each card once set. The store you buy from shows tax at checkout. |
| 11 | Remove fake reviews | Done: the star ratings and review quotes from the old site are gone. No testimonials. |
| 12 | Remove unsupported claims | Done: every game and asset shows its real status. The old site's placeholder prices, discounts and zero-value stats are gone. |
| 13 | Alt text for accessibility | Done: covers carry "Cover art for" plus the name, placeholders say what's coming, and `projects.js` takes an `alt` for every screenshot. |
| 14 | Fix color contrast | Done: body text and the flame accent pass WCAG AA in both themes. |
| 15 | Full keyboard navigation | Done: every control is a real button or link with a visible focus ring. Ctrl+K search with arrow keys, arrow keys in the filter chips, arrow keys move the Current projects carousel, Esc closes the details window, search and menu. |
| 16 | Add business details | Done: studio name in every footer, email and Discord in the Contact section. |
| 17 | Age consent for kids' data | N/A: the site collects no data from anyone. |
| 18 | Unsubscribe link in emails | N/A: the site sends no email. |
| 19 | License every font and image | Done: Archivo and JetBrains Mono under SIL OFL 1.1 (licenses in `fonts/`), Lenis under MIT (license in `vendor/`). No third-party images. |
| 20 | Data deletion requests | Done: the privacy policy explains how to ask, with a 30-day answer. The site itself holds no data. |

## Legal holes (4a)

| Item | Status |
|------|--------|
| Self-hosted fonts and scripts | Done: Archivo, JetBrains Mono and Lenis ship in the repo. The site makes no third-party request on load. |
| No keystroke or session-replay capture | Done: no analytics or replay tools of any kind. |
| Age check on sign-up | N/A: no sign-up or accounts. The contact form only opens your own email app. |
| Postal address and one-click unsubscribe in email | N/A: the site sends no email. Add both before any newsletter or launch email. |
| Renewal terms beside the buy button | N/A: no subscriptions. Purchases happen on itch.io, Fab or the Roblox Creator Store. |
| Upload disclaimer | N/A: no uploads. |

## Motion

Everything that moves runs on closed-form damped springs in `motion.js`: headline words rising on load, sections and cards rising in turn as you scroll, the About numbers counting up, the Current projects carousel, the details window growing out of the card you picked, the drop-down phone menu, search, the toast and image fades. A spring keeps its velocity, so grabbing or reversing an animation mid-flight continues smoothly, and a flick on the carousel or the details window hands its speed to the next spring. Page and theme transitions use the same spring, sampled into a CSS `linear()` curve. The site plays no sound. Reduced-motion settings skip every animation.

## UX patterns

In: command menu (Ctrl+K), shortcut hints, copy toasts, pre-rendering (speculation rules on hover), tinted image placeholders, view transitions within and between pages, swipe-to-dismiss details window (drag down) with Esc, interruptible animations, 44 px hit targets, safe area insets, tabular numbers, balanced headlines, continuous corners.

Skipped, nothing to apply them to: skeleton loaders (all content ships with the page), optimistic updates, undo toasts, stale-while-revalidate, predictive back, one-time code autofill, idempotency keys, safe triangle menus.
