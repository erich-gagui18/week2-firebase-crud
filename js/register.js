// js/register.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
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

redirectIfAuthed();

const registerForm = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");
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
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
  };
  return map[error.code] || error.message || "Something went wrong. Please try again.";
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  registerBtn.disabled = true;

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const programme = document.getElementById("programme").value.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Firebase Authentication handles the login identity (UID, email, password hash).
    // Firestore stores the application-level profile tied to that UID.
    await setDoc(doc(db, "users", cred.user.uid), {
      fullName,
      email,
      programme,
      role: "Student",
      authMethod: "password",
      createdAt: serverTimestamp(),
    });

    showBanner("Account Created Successfully", "granted");
    setTimeout(() => (window.location.href = "dashboard.html"), 700);
  } catch (err) {
    showError(friendlyAuthError(err));
    registerBtn.disabled = false;
  }
});

googleBtn.addEventListener("click", async () => {
  clearMessages();
  googleBtn.disabled = true;

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const ref = doc(db, "users", result.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        fullName: result.user.displayName || "",
        email: result.user.email || "",
        programme: "",
        role: "Student",
        authMethod: "google",
        createdAt: serverTimestamp(),
      });
    }

    showBanner("Account Created Successfully", "granted");
    setTimeout(() => (window.location.href = "dashboard.html"), 700);
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      showError(friendlyAuthError(err));
    }
    googleBtn.disabled = false;
  }
});
