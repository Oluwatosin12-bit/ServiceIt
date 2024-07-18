import { database, storage } from "./FirebaseConfig";
import {
  query,
  where,
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  onSnapshot,
  Timestamp,
  deleteDoc
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {generateRandomID} from "../BookingPage/BookingDB"
import { v4 } from "uuid";

const DATABASE_FOLDER_NAME = "users";
const POSTS_COLLECTION = "Posts";
async function addUser(
  userID,
  firstName,
  lastName,
  userName,
  signUpEmail,
  selectedCategories
) {
  const userDocRef = doc(database, DATABASE_FOLDER_NAME, userID);
  return await setDoc(userDocRef, {
    userID: userID,
    FirstName: firstName,
    LastName: lastName,
    UserName: userName,
    Email: signUpEmail,
    feedCategories: selectedCategories || [],
  });
}

async function isDatabaseExist() {
  const usersCollection = query(collection(database, DATABASE_FOLDER_NAME));
  const querySnapshot = await getDocs(usersCollection);
  return !querySnapshot.empty;
}

async function isUsernameUnique(username) {
  const databaseExists = await isDatabaseExist(DATABASE_FOLDER_NAME);
  if (databaseExists === false) {
    return true;
  }
  const usersCollection = collection(database, DATABASE_FOLDER_NAME);
  const check = query(usersCollection, where("UserName", "==", username));
  const querySnapshot = await getDocs(check);
  return querySnapshot.empty;
}

const getUserData = async (uid) => {
  if (uid === null) {
    return;
  }
  try {
    const userDocRef = doc(database, DATABASE_FOLDER_NAME, uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data();
    }
  } catch (error) {
    throw new Error(`Error accessing User data: ${error.message}`);
  }
};

const uploadPostImage = async (serviceCategory, imageUpload) => {
  try {
    const imageRef = ref(
      storage,
      `${serviceCategory}/${imageUpload.name + v4()}`
    );
    await uploadBytes(imageRef, imageUpload);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

const createPost = async (formData, imageUpload, userID, userData) => {
  try {
    const imageURL = await uploadPostImage(
      formData.serviceCategories[0],
      imageUpload
    );
    const generatedID = generateRandomID();
    const createdAt = Timestamp.now();
    const vendorUsername = userData.UserName;
    const formDataWithImage = {
      ...formData,
      imageURL,
      createdAt,
      vendorUsername,
      vendorUID: userID,
    };

    if (userID === null) {
      throw new Error(`Invalid user ID: ${error.message}`);
    }

    const userDocRef = doc(database, DATABASE_FOLDER_NAME, userID);
    const postsCollectionRef = collection(userDocRef, POSTS_COLLECTION);
    const postDocRef = doc(postsCollectionRef, generatedID);
    await setDoc(postDocRef, formDataWithImage);
  } catch (error) {
    throw new Error(`Error creating post: ${error.message}`);
  }
};

const deletePost = (userUID, postID) =>{
  const favoritesRef = collection(database, DATABASE_FOLDER_NAME, userUID, POSTS_COLLECTION);
  const postDocRef = doc(favoritesRef, postID);
  deleteDoc(postDocRef);
}

const fetchUserPosts = (userID, callback) => {
  if (userID === null) {
    return;
  }
  const q = query(
    collection(
      database,
      `${DATABASE_FOLDER_NAME}/${userID}/${POSTS_COLLECTION}`
    )
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const postsData = [];
    querySnapshot.forEach((doc) => {
      postsData.push(doc.data());
    });

    callback(postsData);
  });

  return unsubscribe;
};

export {
  addUser,
  isUsernameUnique,
  getUserData,
  createPost,
  fetchUserPosts,
  deletePost
};
