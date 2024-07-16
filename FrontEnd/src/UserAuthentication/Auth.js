import { auth } from "./FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useState, useEffect } from "react";
import { addUser, isUsernameUnique } from "./FirestoreDB";

const registerUser = async (
  email,
  password,
  username,
  name,
  selectedCategories
) => {
  try {
    const isUnique = await isUsernameUnique(username);
    if (isUnique !== true) {
      return null;
    }
    const newUser = await createUserWithEmailAndPassword(auth, email, password);
    const userId = newUser.user.uid;
    const userAddedToDB = await addUser(
      userId,
      firstName,
      name,
      email,
      selectedCategories || []
    );
    if (newUser !== null && userAddedToDB !== false) {
      return newUser;
    }
    return null;
  } catch (error) {
    throw new Error(`Error registering user: ${error.message}`);
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
    throw new Error(`Error logging in: ${error.message}`);
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
    throw new Error(`Error recovering password: ${error.message}`);
  }
};

const useUID = () => {
  const [userUID, setUserUID] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return userUID;
};

export {
  registerUser,
  loginUser,
  logOutUser,
  recoverPassword,
  auth,
  useUID,
  onAuthStateChanged,
};
