# Changelog

## [1.0.0] — Initial delivery

### Added
- `index.html` (Screen 2 — Login): Email/Password login form, "Continue
  with Google" button, Access Granted / Access Denied banner language
  matching the activity spec, link to registration.
- `register.html` (Screen 1 — Registration): Full Name / Email / Password
  / Programme fields plus Google Sign-In, "Account Created Successfully"
  confirmation.
- `dashboard.html` (Screen 3 — Protected Dashboard): welcome message,
  full name, email, programme, role, authentication method, and an
  "Authenticated" status chip; inline prompt to set Programme if missing
  (covers first-time Google sign-in, which has no programme data).
- `js/auth-guard.js`: shared `requireAuth()` / `redirectIfAuthed()` route
  protection used by all three pages.
- `js/login.js`, `js/register.js`, `js/dashboard.js`: page-specific
  Firebase Auth + Firestore logic (Email/Password and Google Sign-In,
  profile read/write, logout).
- `firestore.rules`: per-user profile isolation (`request.auth.uid ==
  userId`) on the `users` collection, plus a role-immutability check so a
  user can't self-assign a different role; Week 2's `students` rules
  block preserved as a separate `match` block for projects that reuse
  that Firebase project.
- `css/style.css`: "Monochrome Ledger" theme carried over from Week 2 for
  visual consistency across IPT102 deliverables — Space Grotesk / Inter /
  JetBrains Mono, dotted-paper background, pill buttons.
- `firebase.json` (Hosting + Firestore rules config), `.firebaserc`,
  `.gitignore`, `.vscode/launch.json`, `README.md`.
