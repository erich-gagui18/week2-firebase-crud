// app.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------- DOM references ----------
const authSection = document.getElementById("authSection");
const protectedSection = document.getElementById("protectedSection");
const userBar = document.getElementById("userBar");
const userEmailEl = document.getElementById("userEmail");
const userAvatarEl = document.getElementById("userAvatar");
const logoutBtn = document.getElementById("logoutBtn");

// Deterministic accent color for avatars, derived from a string (email or name)
const AVATAR_COLORS = ["#000000", "#1a1a1a", "#2b2b2b", "#3d3d3d", "#4f4f4f", "#606060"];
function colorFor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initialsFor(nameOrEmail) {
  const base = (nameOrEmail || "").trim();
  if (!base) return "?";
  const namePart = base.includes("@") ? base.split("@")[0] : base;
  const parts = namePart.split(/[\s._-]+/).filter(Boolean);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : namePart.slice(0, 2);
  return initials.toUpperCase();
}

const tabButtons = document.querySelectorAll(".tab-btn");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const authError = document.getElementById("authError");
const authSuccess = document.getElementById("authSuccess");

const studentForm = document.getElementById("studentForm");
const recordIdInput = document.getElementById("recordId");
const fullNameInput = document.getElementById("fullName");
const studentIDInput = document.getElementById("studentID");
const programmeInput = document.getElementById("programme");
const yearInput = document.getElementById("year");
const emailInput = document.getElementById("email");
const favTechInput = document.getElementById("favouriteTechnology");

const addBtn = document.getElementById("addBtn");
const updateBtn = document.getElementById("updateBtn");
const clearBtn = document.getElementById("clearBtn");
const formTitle = document.getElementById("formTitle");

const crudError = document.getElementById("crudError");
const crudSuccess = document.getElementById("crudSuccess");

const recordsBody = document.getElementById("recordsBody");
const emptyState = document.getElementById("emptyState");

const confirmModal = document.getElementById("confirmModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let unsubscribeRecords = null;
let pendingDeleteId = null;

// ---------- Helpers ----------
function showMessage(el, text) {
  el.textContent = text;
  el.classList.remove("hidden");
}

function clearMessages(...els) {
  els.forEach((el) => {
    el.textContent = "";
    el.classList.add("hidden");
  });
}

function friendlyAuthError(error) {
  const map = {
    "auth/invalid-email": "That email address looks invalid.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters."
  };
  return map[error.code] || error.message || "Something went wrong. Please try again.";
}

// ---------- Tab switching (Login / Register) ----------
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    clearMessages(authError, authSuccess);
  });
});

// ---------- Registration ----------
registerTab.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages(authError, authSuccess);

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;

  if (password !== confirmPassword) {
    showMessage(authError, "Passwords do not match.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showMessage(authSuccess, "Account created successfully. You are now logged in.");
    registerTab.reset();
  } catch (error) {
    showMessage(authError, friendlyAuthError(error));
  }
});

// ---------- Login ----------
loginTab.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages(authError, authSuccess);

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginTab.reset();
  } catch (error) {
    showMessage(authError, friendlyAuthError(error));
  }
});

// ---------- Logout ----------
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
});

// ---------- Auth state observer ----------
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.classList.add("hidden");
    protectedSection.classList.remove("hidden");
    userBar.classList.remove("hidden");
    userEmailEl.textContent = user.email;
    userAvatarEl.textContent = initialsFor(user.email);
    userAvatarEl.style.background = colorFor(user.email);

    clearMessages(authError, authSuccess);
    resetForm();
    subscribeToRecords(user.uid);
  } else {
    authSection.classList.remove("hidden");
    protectedSection.classList.add("hidden");
    userBar.classList.add("hidden");
    userEmailEl.textContent = "";

    if (unsubscribeRecords) {
      unsubscribeRecords();
      unsubscribeRecords = null;
    }
    recordsBody.innerHTML = "";
  }
});

// ---------- Form reset ----------
function resetForm() {
  studentForm.reset();
  recordIdInput.value = "";
  addBtn.classList.remove("hidden");
  updateBtn.classList.add("hidden");
  formTitle.textContent = "Add Student Record";
  clearMessages(crudError, crudSuccess);
}

clearBtn.addEventListener("click", resetForm);

function readFormValues() {
  return {
    fullName: fullNameInput.value.trim(),
    studentID: studentIDInput.value.trim(),
    programme: programmeInput.value.trim(),
    year: yearInput.value,
    email: emailInput.value.trim(),
    favouriteTechnology: favTechInput.value.trim()
  };
}

function validateFormValues(values) {
  if (!values.fullName || !values.studentID || !values.programme ||
      !values.year || !values.email || !values.favouriteTechnology) {
    return "Please fill in all fields.";
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(values.email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

// ---------- Create ----------
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages(crudError, crudSuccess);

  const user = auth.currentUser;
  if (!user) return;

  const values = readFormValues();
  const validationError = validateFormValues(values);
  if (validationError) {
    showMessage(crudError, validationError);
    return;
  }

  try {
    await addDoc(collection(db, "students"), {
      ...values,
      ownerId: user.uid,
      createdAt: serverTimestamp()
    });
    showMessage(crudSuccess, "Record added successfully.");
    resetForm();
  } catch (error) {
    console.error(error);
    showMessage(crudError, "Could not add the record. Please try again.");
  }
});

// ---------- Update ----------
updateBtn.addEventListener("click", async () => {
  clearMessages(crudError, crudSuccess);

  const id = recordIdInput.value;
  if (!id) return;

  const values = readFormValues();
  const validationError = validateFormValues(values);
  if (validationError) {
    showMessage(crudError, validationError);
    return;
  }

  try {
    await updateDoc(doc(db, "students", id), { ...values });
    showMessage(crudSuccess, "Record updated successfully.");
    resetForm();
  } catch (error) {
    console.error(error);
    showMessage(crudError, "Could not update the record. Please try again.");
  }
});

// ---------- Read (live subscription, scoped to current user) ----------
function subscribeToRecords(uid) {
  const q = query(collection(db, "students"), where("ownerId", "==", uid));

  unsubscribeRecords = onSnapshot(
    q,
    (snapshot) => {
      renderRecords(snapshot);
    },
    (error) => {
      console.error(error);
      showMessage(crudError, "Could not load records.");
    }
  );
}

function renderRecords(snapshot) {
  recordsBody.innerHTML = "";

  if (snapshot.empty) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");

    const initials = initialsFor(data.fullName);
    const avatarColor = colorFor(data.fullName || data.studentID || "");

    tr.innerHTML = `
      <td data-label="Full Name">
        <span class="name-cell">
          <span class="row-avatar" style="background:${avatarColor}">${escapeHtml(initials)}</span>
          ${escapeHtml(data.fullName)}
        </span>
      </td>
      <td data-label="Student ID"><span class="id-chip">${escapeHtml(data.studentID)}</span></td>
      <td data-label="Programme">${escapeHtml(data.programme)}</td>
      <td data-label="Year"><span class="year-chip">${escapeHtml(data.year)}</span></td>
      <td data-label="Email">${escapeHtml(data.email)}</td>
      <td data-label="Favourite Tech">${escapeHtml(data.favouriteTechnology)}</td>
      <td data-label="Actions" class="row-actions">
        <button class="btn btn-warning edit-btn">Edit</button>
        <button class="btn btn-danger delete-btn">Delete</button>
      </td>
    `;

    tr.querySelector(".edit-btn").addEventListener("click", () => loadRecordIntoForm(docSnap.id, data));
    tr.querySelector(".delete-btn").addEventListener("click", () => openDeleteModal(docSnap.id));

    recordsBody.appendChild(tr);
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

// ---------- Load record into form (for Update) ----------
function loadRecordIntoForm(id, data) {
  clearMessages(crudError, crudSuccess);

  recordIdInput.value = id;
  fullNameInput.value = data.fullName;
  studentIDInput.value = data.studentID;
  programmeInput.value = data.programme;
  yearInput.value = data.year;
  emailInput.value = data.email;
  favTechInput.value = data.favouriteTechnology;

  addBtn.classList.add("hidden");
  updateBtn.classList.remove("hidden");
  formTitle.textContent = "Edit Student Record";

  studentForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Delete (with confirmation modal) ----------
function openDeleteModal(id) {
  pendingDeleteId = id;
  confirmModal.classList.remove("hidden");
}

function closeDeleteModal() {
  pendingDeleteId = null;
  confirmModal.classList.add("hidden");
}

cancelDeleteBtn.addEventListener("click", closeDeleteModal);

confirmDeleteBtn.addEventListener("click", async () => {
  if (!pendingDeleteId) return;

  try {
    await deleteDoc(doc(db, "students", pendingDeleteId));
    showMessage(crudSuccess, "Record deleted successfully.");
    if (recordIdInput.value === pendingDeleteId) {
      resetForm();
    }
  } catch (error) {
    console.error(error);
    showMessage(crudError, "Could not delete the record. Please try again.");
  } finally {
    closeDeleteModal();
  }
});