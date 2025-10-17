import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAHlHMo-_cLJCtOyzN2knRoHUnDCC3y8lM",
  authDomain: "infra-web-810bb.firebaseapp.com",
  projectId: "infra-web-810bb",
  storageBucket: "infra-web-810bb.firebasestorage.app",
  messagingSenderId: "151794858175",
  appId: "1:151794858175:web:52343516f7aedb2c9e6e0a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;

