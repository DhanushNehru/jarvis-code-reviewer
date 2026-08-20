import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArEXs3c-CUI1283Iccg_dpuUmPy1PfMmo",
  authDomain: "qwiklabs-gcp-00-1dd11e38fdb3.firebaseapp.com",
  projectId: "qwiklabs-gcp-00-1dd11e38fdb3",
  storageBucket: "qwiklabs-gcp-00-1dd11e38fdb3.firebasestorage.app",
  messagingSenderId: "727998743684",
  appId: "1:727998743684:web:4465db2e0b376fc4a5aed1",
  measurementId: "G-M3GRTVQP0Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
