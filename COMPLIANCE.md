# Compliance

Status for the Iron Lantern Studios site. "N/A" means the site has nothing the rule applies to. Revisit any N/A line before you add forms, sales, email or analytics.

| # | Item | Status |
|---|------|--------|
| 1 | Privacy policy | Done: `privacy.html`, linked in every footer. |
| 2 | Terms of service | Done: `terms.html`, linked in every footer. |
| 3 | Refund policy | N/A: the site sells nothing. `terms.html` says future sales get their own refund policy. |
| 4 | Cookie policy | Done: the privacy policy states the site sets no cookies and explains the local-storage theme and filter choice. |
| 5 | Cookie consent banner | N/A: no cookies, no tracking. The stored theme and filter choice is a strictly necessary preference. |
| 6 | Checkbox consents on forms | N/A: no forms. |
| 7 | Collect no unnecessary data | Done: no analytics, no accounts, no third-party requests. |
| 8 | Audit third-party SDKs | Done: none. Fonts are self-hosted in `fonts/`. No CDN scripts. |
| 9 | Remove dark patterns | Done: no popups, no countdowns, no pre-checked boxes. |
| 10 | Remove hidden fees | N/A: nothing for sale. |
| 11 | Remove fake reviews | Done: no reviews or testimonials. |
| 12 | Remove unsupported claims | Done: unfinished projects carry "In development" or "Rebuilding". Platforms come from the project plans. Confirm After Hours targets PC. |
| 13 | Alt text for accessibility | Done: the canvas has a text description. `projects.js` takes an `alt` for every image. |
| 14 | Fix color contrast | Done: body text and the flame accent pass WCAG AA in both themes. |
| 15 | Full keyboard navigation | Done: every control is a real button or link with a visible focus ring. Ctrl+K search, arrow keys in the filters, Esc closes sheets. |
| 16 | Add business details | Open: set `STUDIO.email` in `projects.js` so the footer shows a contact address. |
| 17 | Age consent for kids' data | N/A: the site collects no data from anyone. |
| 18 | Unsubscribe link in emails | N/A: the site sends no email. |
| 19 | License every font and image | Done: Archivo and JetBrains Mono under SIL OFL 1.1, licenses in `fonts/`. The site has no third-party images. Add a license line for any image you add. |
| 20 | Data deletion requests | Done: the privacy policy explains how to ask. The site holds no data to delete. |

## UX patterns

In: skeleton loaders, command menu (Ctrl+K), shortcut hints, pre-rendering (prefetch on hover), tinted image placeholders, view transitions, swipe-to-dismiss sheets with Esc, interruptible animations, 44 px hit targets, safe area insets, tabular numbers, balanced headlines, continuous corners.

Skipped, nothing to apply them to: optimistic updates, undo toasts, stale-while-revalidate, predictive back, one-time code autofill, idempotency keys, safe triangle menus.
