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
| 13 | Alt text for accessibility | Done: the canvas has a text description. `projects.js` takes an `alt` for every image. |
| 14 | Fix color contrast | Done: body text and the flame accent pass WCAG AA in both themes. |
| 15 | Full keyboard navigation | Done: every control is a real button or link with a visible focus ring. Ctrl+K search with arrow keys, arrow keys in the filter chips, Esc closes sheets and menus, E works the lamp. |
| 16 | Add business details | Done: studio name in every footer, email and Discord in the Contact section. |
| 17 | Age consent for kids' data | N/A: the site collects no data from anyone. |
| 18 | Unsubscribe link in emails | N/A: the site sends no email. |
| 19 | License every font and image | Done: Archivo and JetBrains Mono under SIL OFL 1.1 (licenses in `fonts/`), Lenis under MIT (license in `vendor/`). No third-party images. |
| 20 | Data deletion requests | Done: the privacy policy explains how to ask, with a 30-day answer. The site itself holds no data. |

## UX patterns

In: command menu (Ctrl+K), shortcut hints, copy toasts, pre-rendering (speculation rules on hover), tinted image placeholders, view transitions within and between pages, swipe-to-dismiss sheets with Esc, interruptible animations, 44 px hit targets, safe area insets, tabular numbers, balanced headlines, continuous corners.

Skipped, nothing to apply them to: skeleton loaders (all content ships with the page), optimistic updates, undo toasts, stale-while-revalidate, predictive back, one-time code autofill, idempotency keys, safe triangle menus.
