// js/login.js
import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { redirectIfAuthed } from "./auth-guard.js";

redirectIfAuthed(); // already logged in? skip straight to the dashboard

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const googleBtn = document.getElementById("googleBtn");
const banner = document.getElementById("banner");
const authError = document.getElementById("authError");

function showBanner(text, kind) {
  banner.textContent = text;
  banner.className = `access-banner ${kind}`;
  banner.classList.remove("hidden");
}
function showError(text) {
  authError.textContent = text;
  authError.classList.remove("hidden");
}
function clearMessages() {
  banner.classList.add("hidden");
  authError.classList.add("hidden");
}

function friendlyAuthError(error) {
  const map = {
    "auth/invalid-email": "That email address looks invalid.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  };
  return map[error.code] || error.message || "Something went wrong. Please try again.";
}

// Ensures a Firestore profile exists for a Google-authenticated user.
// Created only on first sign-in — existing profiles are left untouched.
async function ensureGoogleProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      fullName: user.displayName || "",
      email: user.email || "",
      programme: "",
      role: "Student",
      authMethod: "google",
      createdAt: serverTimestamp(),
    });
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  loginBtn.disabled = true;

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showBanner("Access Granted", "granted");
    setTimeout(() => (window.location.href = "dashboard.html"), 500);
  } catch (err) {
    showBanner("Access Denied", "denied");
    showError(friendlyAuthError(err));
    loginBtn.disabled = false;
  }
});

googleBtn.addEventListener("click", async () => {
  clearMessages();
  googleBtn.disabled = true;

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await ensureGoogleProfile(result.user);
    showBanner("Access Granted", "granted");
    setTimeout(() => (window.location.href = "dashboard.html"), 500);
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      showBanner("Access Denied", "denied");
      showError(friendlyAuthError(err));
    }
    googleBtn.disabled = false;
  }
});
