import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const FirebaseConfig = {
  apiKey: "AIzaSyCOJ_wtHKAhcbUzxCsPBYvpybWMs_gpwhA",
  authDomain: "bt02-94055.firebaseapp.com",
  databaseURL: "https://bt02-94055-default-rtdb.firebaseio.com",
  projectId: "bt02-94055",
  storageBucket: "bt02-94055.appspot.com",
  messagingSenderId: "1031692203730",
  appId: "1:1031692203730:web:47963585733b413e589f0b",
  measurementId: "G-NFKNWBZV70"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(FirebaseConfig);

export const FIREBASE_AUTH = getAuth(FIREBASE_APP);