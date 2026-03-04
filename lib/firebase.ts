import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9rHgwvJiYGAdN35CtpZaH2K7ARxtdEAA",
  authDomain: "fypshows-database.firebaseapp.com",
  projectId: "fypshows-database",
  storageBucket: "fypshows-database.firebasestorage.app",
  messagingSenderId: "603499165843",
  appId: "1:603499165843:web:f6da34e3d4a1aafba9f566"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
