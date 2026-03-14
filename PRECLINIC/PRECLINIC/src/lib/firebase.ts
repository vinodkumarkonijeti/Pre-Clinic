import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB7Wb-nAKqatcorxQS83U-rRMT0tZPxntE",
  authDomain: "pre-clinic-15438.firebaseapp.com",
  projectId: "pre-clinic-15438",
  storageBucket: "pre-clinic-15438.firebasestorage.app",
  messagingSenderId: "66725867477",
  appId: "1:66725867477:web:54b800c2ce860e4245975c",
  measurementId: "G-4SPH8J0MPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
