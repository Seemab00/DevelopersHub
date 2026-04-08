// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkrIKl_LmBB8zwHFsv5aq3_HJ2yk0l_eY",
  authDomain: "social-connect-98ef6.firebaseapp.com",
  projectId: "social-connect-98ef6",
  storageBucket: "social-connect-98ef6.firebasestorage.app",
  messagingSenderId: "213659037341",
  appId: "1:213659037341:web:b791b4255390de6a62ae74",
  measurementId: "G-MC7P79CH2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
