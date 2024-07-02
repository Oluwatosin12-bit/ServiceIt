import { auth } from "./FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { addUser, isUsernameUnique } from "./FirestoreDB";

const registerUser = async (email, password, username, firstName, lastName) => {
  try {
    const isUnique = await isUsernameUnique(username);
    if (isUnique !== true) {
      alert("Username taken");
      return null;
    }
    const newUser = await createUserWithEmailAndPassword(auth, email, password);
    const userId = newUser.user.uid;
    const addUserToDB = await addUser(
      userId,
      firstName,
      lastName,
      username,
      email
    );
    if (newUser !== null && addUserToDB !== false) {
      return newUser;
    }
    return null;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
};

const loginUser = async (email, password) => {
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    const userData = auth.currentUser.uid;
    const storedPassword = userData.password;
    if (password !== storedPassword) {
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error logging in:", error);
  }
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
  }
};

export {
  registerUser,
  loginUser,
  logOutUser,
  recoverPassword,
  auth,
  onAuthStateChanged,
};
