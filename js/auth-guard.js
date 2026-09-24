// js/auth-guard.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Call on a PROTECTED page (dashboard.html).
 * Redirects to login.html if no user is signed in.
 * Calls onAuthed(user, profile) once a user is confirmed and their
 * Firestore profile has been fetched.
 */
export function requireAuth(onAuthed) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    let profile = null;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) profile = snap.data();
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
    onAuthed(user, profile);
  });
}

/**
 * Call on a PUBLIC auth page (index.html / register.html).
 * If a user is already signed in, skip straight to the dashboard instead
 * of showing the login/register form again.
 */
export function redirectIfAuthed() {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "dashboard.html";
  });
}
