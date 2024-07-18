import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const VITE_API_KEY="AIzaSyA600hzOzPia4ToGokd_G9r4Q8lNPIL4tU";
const VITE_AUTH_DOMAIN="serviceit-4a52d.firebaseapp.com";
const VITE_PROJECT_ID="serviceit-4a52d";
const VITE_STORAGE_BUCKET="serviceit-4a52d.appspot.com";
const VITE_MESSAGING_SENDER_ID="195506194018";
const VITE_APP_ID="1:195506194018:web:6c1f8301b9d0db195b333b";
const VITE_MEASUREMENT_ID="G-QTKCH75V4J";
const VITE_VAPID_KEY="BIk2IwWnyh6QKW0Y6c4ZCNLuNltnCcaGT4hxKNdJl6wgpvQhYfDIkZZ34iU14Ox5zSflGAPL5dmDRbv7GENQrqA"


const firebaseConfig = {
  apiKey: VITE_API_KEY,
  authDomain: VITE_AUTH_DOMAIN,
  projectId: VITE_PROJECT_ID,
  storageBucket: VITE_STORAGE_BUCKET,
  messagingSenderId: VITE_MESSAGING_SENDER_ID,
  appId: VITE_APP_ID,
  measurementId: VITE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);
const storage = getStorage(app);

export { app, auth, database, storage };
