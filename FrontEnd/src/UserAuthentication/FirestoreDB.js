import { database, auth } from "./FirebaseConfig";
import {
  query,
  where,
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import {useState, useEffect} from 'react';

async function addUser(userId, firstName, lastName, userName, signUpEmail) {
  const userDocRef = doc(database, "users", userId);
  return await setDoc(userDocRef, {
    userID: userId,
    FirstName: firstName,
    LastName: lastName,
    UserName: userName,
    Email: signUpEmail,
  });
}

async function isDatabase() {
  const usersCollection = query(collection(database, "users"));
  const querySnapshot = await getDocs(usersCollection);
  return !querySnapshot.empty;
}

async function isUsernameUnique(username) {
  const databaseExists = await isDatabase("users");
  console.log(databaseExists);
  if (databaseExists === false) {
    return true;
  }
  const usersCollection = collection(database, "users");
  const check = query(usersCollection, where("UserName", "==", username));
  const querySnapshot = await getDocs(check);
  return querySnapshot.empty;
}

async function updateUserInfo() {
  const userDocRef = doc(database, "users", uid);
  await setDoc(userDocRef, {});
}

const getUID = () => {
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


const getUserData = async (uid) => {
  if (uid === null) {
    console.log("No UID provided");
    return;
  }
  try {
    const userDocRef = doc(database, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      console.log("User data:", userDocSnap.data());
      return userDocSnap.data()
    }
  } catch (error) {
    console.error("Error accessing Firestore:", error);
  }
};


export { addUser, isUsernameUnique, getUID, getUserData};
