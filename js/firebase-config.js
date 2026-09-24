// js/firebase-config.js
// Replace the values below with your own project's config from:
// Firebase Console > Project Settings > General > Your apps > Web app > SDK setup and configuration
//
// If you're reusing the same Firebase project as your Week 2 CRUD app,
// you can copy those exact same values here — Auth and Firestore are
// shared across your whole project, a new "users" collection just sits
// alongside your existing "students" collection.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
