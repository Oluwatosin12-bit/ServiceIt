import { auth } from "./FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

const registerUser = async (email, password) => {
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    if (user!==null){
      return user;
    };
    return null;
  } catch (error) {
    console.error("Error logging in:", error);
  };
};

const loginUser = async (email, password) => {
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    const userData = auth.currentUser.uid;
    const storedPassword = userData.password;
    if (password !== storedPassword) {
      return null;
    };
    return user;
  } catch (error) {
    console.error("Error logging in:", error);
  };
};

const logOutUser = async () => {
  await signOut(auth);
};

const recoverPassword = async (email) => {
  try {
    const reset = sendPasswordResetEmail(auth, email);
    return reset;
  } catch (error) {
    console.error("Error recovering password:", error);
  };
};

export {
  registerUser,
  loginUser,
  logOutUser,
  recoverPassword,
  auth,
  onAuthStateChanged,
};
