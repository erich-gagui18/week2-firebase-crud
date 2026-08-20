// firebase-config.js
// Replace the values below with the config object from:
// Firebase Console > Project Settings > General > Your apps > Web app > SDK setup and configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNGlmbmwq_nkyUCKmjz3Q3uONFCt7-H6g",
  authDomain: "week2-firebase-crud-gagui.firebaseapp.com",
  projectId: "week2-firebase-crud-gagui",
  storageBucket: "week2-firebase-crud-gagui.firebasestorage.app",
  messagingSenderId: "172845744860",
  appId: "1:172845744860:web:afbc4eef26796e57dd6a19",
  measurementId: "G-1EBL0Z9MQG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);