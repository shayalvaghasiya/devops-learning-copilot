import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const meta = import.meta as any;

const firebaseConfig = {
  apiKey: meta.env.VITE_FIREBASE_API_KEY,
  authDomain: meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, meta.env.VITE_FIREBASE_DATABASE_ID);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};
