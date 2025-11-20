import firebase from 'firebase/compat/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ---------------------------------------------------------
// IMPORTANT: IN PRODUCTION, USE ENVIRONMENT VARIABLES
// Do not commit real keys to GitHub.
// ---------------------------------------------------------

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD_PLACEHOLDER_KEY_FOR_BUILD",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "bittred-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "bittred-app",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app as any);
export const db = getFirestore(app as any);
export const googleProvider = new GoogleAuthProvider();