import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBMvUDwyq7bagDmEr5GoHyvwsLZnuPwirE",
  authDomain: "socialconnect-1948f.firebaseapp.com",
  projectId: "socialconnect-1948f",
  storageBucket: "socialconnect-1948f.firebasestorage.app",
  messagingSenderId: "403105146698",
  appId: "1:403105146698:web:ad5675daebf676c97783b3",
  measurementId: "G-93XM9QKFKE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);