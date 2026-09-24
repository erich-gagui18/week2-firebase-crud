// js/dashboard.js
import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { requireAuth } from "./auth-guard.js";

const gate = document.getElementById("gate");
const content = document.getElementById("dashboardContent");
const userBar = document.getElementById("userBar");
const headerAvatar = document.getElementById("headerAvatar");
const headerUserEmail = document.getElementById("headerUserEmail");
const logoutBtn = document.getElementById("logoutBtn");

const welcomeMsg = document.getElementById("welcomeMsg");
const pfFullName = document.getElementById("pfFullName");
const pfEmail = document.getElementById("pfEmail");
const pfProgramme = document.getElementById("pfProgramme");
const pfRole = document.getElementById("pfRole");
const pfAuthMethod = document.getElementById("pfAuthMethod");

const completeProfileNote = document.getElementById("completeProfileNote");
const programmeInput = document.getElementById("programmeInput");
const saveProgrammeBtn = document.getElementById("saveProgrammeBtn");

function initialsFor(nameOrEmail) {
  const base = (nameOrEmail || "").trim();
  if (!base) return "?";
  const namePart = base.includes("@") ? base.split("@")[0] : base;
  const parts = namePart.split(/[\s._-]+/).filter(Boolean);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : namePart.slice(0, 2);
  return initials.toUpperCase();
}

const AUTH_METHOD_LABELS = {
  password: "Email / Password",
  google: "Google Sign-In",
};

let currentUid = null;

requireAuth((user, profile) => {
  currentUid = user.uid;

  const fullName = profile?.fullName || user.displayName || "Student";
  const email = profile?.email || user.email || "";
  const programme = profile?.programme || "";
  const role = profile?.role || "Student";
  const authMethod = profile?.authMethod || (user.providerData[0]?.providerId === "google.com" ? "google" : "password");

  welcomeMsg.textContent = `Welcome, ${fullName}!`;
  pfFullName.textContent = fullName;
  pfEmail.textContent = email;
  pfProgramme.textContent = programme || "Not set";
  pfRole.textContent = role;
  pfAuthMethod.textContent = AUTH_METHOD_LABELS[authMethod] || authMethod;

  headerUserEmail.textContent = email;
  headerAvatar.textContent = initialsFor(fullName || email);
  userBar.classList.remove("hidden");

  if (!programme) {
    completeProfileNote.classList.remove("hidden");
  }

  gate.classList.add("hidden");
  content.classList.remove("hidden");
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    // requireAuth's onAuthStateChanged listener handles the redirect to
    // index.html once the signed-out state is detected.
  } catch (err) {
    console.error("Logout error:", err);
  }
});

saveProgrammeBtn.addEventListener("click", async () => {
  const value = programmeInput.value.trim();
  if (!value || !currentUid) return;

  saveProgrammeBtn.disabled = true;
  try {
    await setDoc(doc(db, "users", currentUid), { programme: value }, { merge: true });
    pfProgramme.textContent = value;
    completeProfileNote.classList.add("hidden");
  } catch (err) {
    console.error("Failed to save programme:", err);
    saveProgrammeBtn.disabled = false;
  }
});
