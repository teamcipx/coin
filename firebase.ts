import firebase from 'firebase/compat/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ---------------------------------------------------------
// FIX: Vite uses import.meta.env and VITE_ prefix
// ---------------------------------------------------------

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize check to prevent crashes if keys are missing
if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing! Check your .env file or Vercel settings.");
}

const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app as any);
export const db = getFirestore(app as any);
export const googleProvider = new GoogleAuthProvider();
