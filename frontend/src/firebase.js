import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBEhFnMjRlW9r8UPOF6ykdNlE9Bkw9xQ08",
  authDomain: "trans-4d075.firebaseapp.com",
  projectId: "trans-4d075",
  storageBucket: "trans-4d075.firebasestorage.app",
  messagingSenderId: "1042646675064",
  appId: "1:1042646675064:web:31eaa8e69f3ff82ddd078d",
  measurementId: "G-3MER1M9EVV"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export { messaging, getToken, onMessage };
