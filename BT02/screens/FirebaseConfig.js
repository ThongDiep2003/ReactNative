import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const FirebaseConfig = {
  apiKey: "AIzaSyB3jwuCchb8v8vCnYAV1H_MBpOSB9cv9jw",
  authDomain: "flowup-a1ead.firebaseapp.com",
  databaseURL: "https://flowup-a1ead-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "flowup-a1ead",
  storageBucket: "flowup-a1ead.appspot.com",
  messagingSenderId: "327504117742",
  appId: "1:327504117742:web:69ef5dadd6213d0b1258ff",
  measurementId: "G-VPKPQVMVVT"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(FirebaseConfig);

export const FIREBASE_AUTH = getAuth(FIREBASE_APP);