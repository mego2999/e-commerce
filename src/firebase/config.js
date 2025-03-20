import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAdhZEQmMrg1WZN0ILlu79JHIFz2EhLuVI",
  authDomain: "test-a9211.firebaseapp.com",
  projectId: "test-a9211",
  storageBucket: "test-a9211.firebasestorage.app",
  messagingSenderId: "1028183832347",
  appId: "1:1028183832347:web:46fe022e240f7a2c27c5be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 