# Changelog

## [1.4.0] — "Monochrome Ledger" design system

### Changed
- Replaced the neo-brutalist theme with the "Monochrome Ledger" design:
  Space Grotesk (display) + Inter (body) + JetBrains Mono (data/labels)
  via Google Fonts, a subtle dotted-paper background, and depth from soft
  shadows and rounded pill shapes instead of hard offset borders.
- Added a brand mark (SVG logo + eyebrow label) to the header, a user
  avatar with deterministic initials/color, and section eyebrows above
  each card heading.
- Records table rows now show a name avatar, a monospace `id-chip` for
  Student ID, and a pill `year-chip` for Year; on screens ≤680px the
  table collapses into stacked label/value cards instead of scrolling
  sideways.
- Buttons now differentiate by shape/pattern instead of only color:
  solid pill = primary, outline = secondary, dashed outline = edit,
  squared outline = delete.
- Added subtle entrance animations (card rise, tab fade, modal pop) that
  respect `prefers-reduced-motion`.
- Rebuilt `404.html` to match, with the same fonts, brand mark, and
  pill button.
- `js/app.js` updated to render the new avatar/chip markup and populate
  `data-label` attributes for the responsive stacked-card table; no
  Firebase logic changed.

## [1.3.0] — Black & white neo-brutalist theme

### Changed
- Replaced the violet/indigo theme with a pure black-and-white, high-contrast
  design: bold black borders, hard offset shadows (no blur, no gradients),
  and status conveyed through symbols (✓ / ✕) and weight instead of color.
- Buttons and inputs get a "pressed" tactile effect: shadow shifts on hover
  and collapses on click.
- Added explicit mobile breakpoints (`max-width: 640px`, `400px`): header
  stacks, tabs and buttons go full-width, table text and padding shrink,
  row actions stack vertically on narrow screens.
- Rebuilt `404.html` in the same theme (bordered card, offset shadow,
  uppercase type) instead of the previous gradient version.
- No HTML structure, IDs, or classes changed — `js/app.js` is unaffected.

## [1.2.0] — Modern UI/UX redesign

### Changed
- Reworked `css/style.css` with a new dark-indigo / violet color system,
  pill-shaped tabs, gradient buttons with hover lift, and a refreshed
  table, form, alert, and modal treatment. No HTML structure, element
  IDs, or class names were changed, so `js/app.js` behavior (tab
  switching, CRUD, modal, auth state) is unaffected.
- Redesigned `404.html` to match the app's new color palette and
  typography instead of the default Firebase Hosting template.

### Removed
- Deleted the unused `package.json` / `package-lock.json` / `node_modules`
  left behind by `firebase init`'s GitHub Actions setup. The app loads
  Firebase via the `gstatic.com` CDN in `js/firebase-config.js`, not via
  npm, so these added ~180MB with no effect on the running app.

## [1.1.0] — Project structure cleanup

### Changed
- Moved `style.css` into `css/style.css`.
- Moved `app.js` and `firebase-config.js` into `js/`.
- Updated `index.html` to reference the new `css/style.css` and `js/app.js`
  paths (the `js/app.js` → `js/firebase-config.js` import is unaffected,
  since both files now live in the same folder).
- Updated `firebase.json` hosting `ignore` list to also exclude
  `firebase-debug.*.log*`.

### Added
- `.gitignore` — excludes logs, the local `.firebase/` cache, and
  `node_modules/`.
- `.firebaserc` — Firebase CLI project alias, with a placeholder project ID
  to be replaced on `firebase init`.
- `.vscode/launch.json` — one-click "Launch Chrome against localhost" debug
  config for local development.

## [1.0.0] — Initial delivery

### Added
- `index.html` — Login/Register tabbed auth UI, protected student form, and
  live records table with Edit/Delete actions.
- `style.css` — Responsive styling for auth screens, form, table, and delete
  confirmation modal.
- `app.js`:
  - Email/Password registration, login, logout via Firebase Auth.
  - `onAuthStateChanged` gating: protected section only renders for signed-in
    users; live Firestore listener is torn down on logout.
  - Friendly, mapped error messages for common Firebase Auth error codes.
  - Create/Update/Delete against the `students` Firestore collection, with
    `ownerId` stamped to the authenticated user's UID on create.
  - Read implemented as a live `onSnapshot` query filtered by
    `where("ownerId", "==", uid)` — table updates automatically on any
    change, no manual refresh needed.
  - Delete confirmation modal before any record is removed.
  - Basic client-side validation (required fields, email format).
- `firebase-config.js` — Firebase modular SDK (v10) initialization with
  placeholder config values.
- `firebase.json` — Hosting configuration (serves the project root).
- `firestore.rules` — Recommended security rules restricting read/update/
  delete to the record's `ownerId`.
- `README.md` — Setup, deployment, and testing instructions.
