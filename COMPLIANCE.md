# Compliance

Status for the Iron Lantern Studios site. "N/A" means the site has nothing the rule applies to. Revisit any N/A line before you add forms, sales, email or analytics.

| # | Item | Status |
|---|------|--------|
| 1 | Privacy policy | Done: `privacy.html`, linked in every footer. |
| 2 | Terms of service | Done: `terms.html`, linked in every footer. |
| 3 | Refund policy | N/A: the site sells nothing yet. Add a refund policy before any asset goes on sale. |
| 4 | Cookie policy | Done: the privacy policy states the site sets no cookies and explains the stored theme choice. |
| 5 | Cookie consent banner | N/A: no cookies, no tracking. The stored theme choice is a strictly necessary preference. |
| 6 | Checkbox consents on forms | N/A: no forms. |
| 7 | Collect no unnecessary data | Done: no analytics, no accounts, no third-party requests. |
| 8 | Audit third-party SDKs | Done: Lenis (smooth scrolling, MIT) is the only library, self-hosted in `vendor/`. Fonts are self-hosted in `fonts/`. No CDN requests. |
| 9 | Remove dark patterns | Done: no popups, no countdowns, no pre-checked boxes. |
| 10 | Remove hidden fees | N/A: nothing for sale. |
| 11 | Remove fake reviews | Done: the star ratings and review quotes from the old site are gone. No testimonials. |
| 12 | Remove unsupported claims | Done: every game and asset shows its real status. The old site's placeholder prices, discounts and zero-value stats are gone. |
| 13 | Alt text for accessibility | Done: the canvas has a text description. `projects.js` takes an `alt` for every image. |
| 14 | Fix color contrast | Done: body text and the flame accent pass WCAG AA in both themes. |
| 15 | Full keyboard navigation | Done: every control is a real button or link with a visible focus ring. Ctrl+K search with arrow keys, Esc closes sheets, E works the lamp. |
| 16 | Add business details | Done: studio name in every footer, email and Discord in the Contact section. |
| 17 | Age consent for kids' data | N/A: the site collects no data from anyone. |
| 18 | Unsubscribe link in emails | N/A: the site sends no email. |
| 19 | License every font and image | Done: Archivo and JetBrains Mono under SIL OFL 1.1 (licenses in `fonts/`), Lenis under MIT (license in `vendor/`). No third-party images. |
| 20 | Data deletion requests | Done: the privacy policy explains how to ask. The site holds no data to delete. |

## UX patterns

In: skeleton loaders, command menu (Ctrl+K), shortcut hints, copy toasts, pre-rendering (prefetch on hover), tinted image placeholders, view transitions, swipe-to-dismiss sheets with Esc, interruptible animations, 44 px hit targets, safe area insets, tabular numbers, balanced headlines, continuous corners.

Skipped, nothing to apply them to: optimistic updates, undo toasts, stale-while-revalidate, predictive back, one-time code autofill, idempotency keys, safe triangle menus.
