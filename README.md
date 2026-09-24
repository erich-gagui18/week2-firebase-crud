# Week 4 Activity — Student Access Portal (Firebase Authentication Module)

A Firebase web app demonstrating a full authentication module: user
registration, Email/Password login, Google Sign-In, a Firestore user
profile, a protected dashboard, logout, and basic security rules.

## Project Structure

```
week4-student-portal/
├── .firebaserc            # Firebase CLI project alias (set your project ID)
├── .gitignore
├── .vscode/
│   └── launch.json
├── css/
│   └── style.css           # "Monochrome Ledger" theme (matches Week 2)
├── js/
│   ├── firebase-config.js   # Firebase project configuration (fill in your own keys)
│   ├── auth-guard.js        # Shared route protection (requireAuth / redirectIfAuthed)
│   ├── login.js             # Screen 2 logic
│   ├── register.js          # Screen 1 logic
│   └── dashboard.js         # Screen 3 logic
├── index.html               # Screen 2 — Login (entry point)
├── register.html            # Screen 1 — Registration
├── dashboard.html            # Screen 3 — Protected Dashboard
├── firebase.json             # Hosting + Firestore rules config
├── firestore.rules           # Security rules (per-user profile isolation)
├── README.md
└── CHANGELOG.md
```

## How auth protection works

- **`js/auth-guard.js`** exports two functions used across all three pages:
  - `requireAuth(callback)` — used on `dashboard.html`. Listens for auth
    state; if no user is signed in, redirects to `index.html` immediately.
    If a user is signed in, fetches their Firestore profile and calls
    `callback(user, profile)`.
  - `redirectIfAuthed()` — used on `index.html` and `register.html`. If a
    user is already signed in, skips straight to `dashboard.html` instead
    of showing the login/register form again.
- This is a **client-side UX convenience only**. The actual security
  boundary is `firestore.rules` — a user cannot read or write another
  user's profile document no matter what the client does, because the
  rules enforce `request.auth.uid == userId` server-side.

## Setup

1. **Firebase project** — reuse your Week 2 project (simplest — Auth and
   Firestore are shared across your whole project, so a new `users`
   collection just sits alongside `students`), or create a new one at the
   [Firebase Console](https://console.firebase.google.com/).

2. **Fill in `js/firebase-config.js`** with your project's config object
   (Project Settings → General → Your apps → Web app).

3. **Enable Email/Password sign-in** — Authentication → Sign-in method →
   Email/Password → Enable.

4. **Enable Google sign-in** — Authentication → Sign-in method → Google →
   Enable → set a support email.

5. **Create Firestore** (if not already created from Week 2) — Firestore
   Database → Create database. The `users` collection is created
   automatically on first registration.

6. **Apply the security rules** — Firestore Database → Rules, paste the
   contents of `firestore.rules`, and publish. (If reusing the Week 2
   project, merge this with your existing `students` rules block — both
   are already included in this file as separate `match` blocks.)

7. **Run locally** — this app uses ES modules (`type="module"`), so it
   must be served over `http://`, not opened as a `file://` path:
   ```
   firebase emulators:start
   ```
   or `npx serve .`, or the VS Code "Live Server" extension.

8. **Deploy**
   ```
   firebase login
   firebase init            # if not already initialized for this folder
   firebase deploy
   ```

## Testing Checklist

Matches the activity's Section 5.6:

- [ ] Register a new user → account created, redirected to dashboard
- [ ] Correct email/password → login successful ("Access Granted")
- [ ] Incorrect password → "Access Denied" shown, not signed in
- [ ] Google Sign-In → login successful, profile auto-created on first use
- [ ] Visit `dashboard.html` directly while logged out → redirected to login
- [ ] View own profile → full name, email, programme, role, auth method all correct
- [ ] Logout → session ends, redirected/blocked from dashboard
- [ ] Visit `dashboard.html` again after logout → access denied (redirected)
- [ ] Log in as a second account → cannot see or edit the first account's profile
      (test directly against Firestore rules, e.g. via the Rules Playground
      in the console, not just through the UI)

## Notes

- Firebase Authentication verifies **identity** (who you are); Firestore
  security rules handle **authorization** (what you're allowed to touch)
  — the two are separate layers, both required for a genuinely secure app.
- A Google-authenticated user has no "Programme" from Google's own data,
  so the dashboard shows an inline prompt to set it on first login. Once
  saved, it behaves identically to an Email/Password profile.
- All Firebase access happens client-side through the modular v10 SDK,
  loaded via the `gstatic.com` CDN — no build step or `npm install`
  required for the app itself.
