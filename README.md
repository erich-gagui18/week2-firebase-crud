# Week 2 Activity — Firebase Authentication and Database CRUD

A Firebase web application where registered users can log in and manage their
own **student records** (Full Name, Student ID, Programme, Year, Email,
Favourite Technology) stored in **Cloud Firestore**, with **Firebase
Authentication** protecting the CRUD interface.

## Project Structure

```
week2-firebase-crud/
├── .firebaserc            # Firebase CLI project alias (set your project ID)
├── .gitignore
├── .vscode/
│   └── launch.json         # Launch Chrome against a local dev server
├── css/
│   └── style.css           # Styling (responsive)
├── js/
│   ├── app.js               # Auth logic + Firestore CRUD logic
│   └── firebase-config.js   # Firebase project configuration (fill in your own keys)
├── index.html              # Auth screens + protected student form + records table
├── firebase.json           # Firebase Hosting configuration
├── firestore.rules         # Recommended security rules (per-user data isolation)
├── README.md
└── CHANGELOG.md
```

## Features

- **Authentication**: Email/Password registration, login, logout, friendly
  error messages, current user's email displayed, CRUD interface hidden from
  unauthenticated users.
- **Student form**: labeled fields with validation (required fields, email
  format, minimum password length).
- **CRUD against Firestore `students` collection**:
  - **Create** — adds a record with `ownerId` set to the logged-in user's UID
    and `createdAt` as a server timestamp; clears the form and shows a
    success message.
  - **Read** — live (`onSnapshot`) query filtered by `where("ownerId", "==",
    uid)`, so each user only ever sees their own records.
  - **Update** — clicking **Edit** loads the record into the form and swaps
    the button to **Update Record**.
  - **Delete** — clicking **Delete** opens a confirmation modal before
    removing the record; the table refreshes automatically (it's a live
    listener, so no manual refresh is needed).

## Setup

1. **Create a Firebase project**
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project and add a **Web app** to it.
   - Copy the config object it gives you.

2. **Fill in `js/firebase-config.js`**
   - Paste your `apiKey`, `authDomain`, `projectId`, `storageBucket`,
     `messagingSenderId`, and `appId` into the placeholders.

3. **Enable Authentication**
   - In the console: **Authentication → Get Started → Sign-in method →
     Email/Password → Enable**.

4. **Create Firestore**
   - In the console: **Firestore Database → Create database** and choose a
     location.
   - The `students` collection is created automatically the first time a
     record is added — you don't need to create it manually.

5. **(Recommended) Apply the security rules**
   - In the console: **Firestore Database → Rules**, paste the contents of
     `firestore.rules`, and publish. This enforces server-side that a user
     can only read, update, or delete their own records — the client-side
     query alone is not a security boundary.

6. **Run locally**
   - Because the app uses ES modules (`type="module"`), open it through a
     local server rather than double-clicking the HTML file, e.g.:
     ```
     npx serve .
     ```
     or the VS Code "Live Server" extension.

7. **Deploy to Firebase Hosting**
   ```
   npm install -g firebase-tools   # if not already installed
   firebase login
   firebase init                   # choose Hosting, select your project, public dir = "."
   firebase deploy --only hosting
   ```
   `firebase init` will overwrite `.firebaserc` with your actual project ID
   (it currently contains the placeholder `YOUR_FIREBASE_PROJECT_ID`).
   Firebase will give you a Hosting URL after deployment.

## Testing Checklist

- [ ] Register a new user
- [ ] Log in with the registered account
- [ ] Add at least three student records
- [ ] Confirm records display correctly
- [ ] Update at least one record
- [ ] Delete at least one record (confirm the modal appears)
- [ ] Log out and confirm the protected form is hidden
- [ ] Log back in and confirm the remaining records still appear
- [ ] Log in as a second user and confirm you do **not** see the first
      user's records

## Notes

- All Firestore access happens client-side through the modular Firebase v10
  SDK (loaded via CDN in `app.js` and `firebase-config.js` — no build step or
  `npm install` is required for the app itself).
- Passwords are handled entirely by Firebase Authentication; this app never
  stores or sees raw passwords beyond the sign-in call.
