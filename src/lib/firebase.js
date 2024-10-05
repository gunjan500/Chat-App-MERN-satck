import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chat-nest-8d359.firebaseapp.com",
  projectId: "chat-nest-8d359",
  storageBucket: "chat-nest-8d359.appspot.com",
  messagingSenderId: "1015492895655",
  appId: "1:1015492895655:web:fd8de3477bb9ebbdae4c82"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage(app);