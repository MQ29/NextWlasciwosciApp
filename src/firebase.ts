import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC0x7uhFjyMfcWeUnTqYHz2rvq7TPx_IDI",
    authDomain: "wlasciwosci.firebaseapp.com",
    projectId: "wlasciwosci",
    storageBucket: "wlasciwosci.firebasestorage.app",
    messagingSenderId: "382310256963",
    appId: "1:382310256963:web:120d401b835076fc165ff6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
