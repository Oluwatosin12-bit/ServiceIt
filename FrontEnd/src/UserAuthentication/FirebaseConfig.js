import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA600hzOzPia4ToGokd_G9r4Q8lNPIL4tU",
  authDomain: "serviceit-4a52d.firebaseapp.com",
  projectId: "serviceit-4a52d",
  storageBucket: "serviceit-4a52d.appspot.com",
  messagingSenderId: "195506194018",
  appId: "1:195506194018:web:6c1f8301b9d0db195b333b",
  measurementId: "G-QTKCH75V4J",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);
const storage = getStorage(app);

export { app, auth, database, storage };
