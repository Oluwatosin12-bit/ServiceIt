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
  orderBy
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";

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
  if (databaseExists === false) {
    return true;
  }
  const usersCollection = collection(database, "users");
  const check = query(usersCollection, where("UserName", "==", username));
  const querySnapshot = await getDocs(check);
  return querySnapshot.empty;
}

async function updateUserData() {
  const userDocRef = doc(database, "users", uid);
  await setDoc(userDocRef, {});
}

const getUserData = async (uid) => {
  try {
    const userDocRef = doc(database, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data();
    }
  } catch (error) {
    throw new Error("Error accessing Firestore");
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
    throw new Error("Error uploading image");
  }
};

const createPost = async (formData, serviceCategory, imageUpload, userId) => {
  try {
    const imageURL = await uploadPostImage(serviceCategory, imageUpload);
    const formDataWithImage = { ...formData, imageURL };
    if (userId === null) {
      throw new Error("Invalid user ID");
    }
    if (formData.serviceTitle === null) {
      throw new Error("Invalid service title");
    }
    const userDocRef = doc(database, "users", userId);
    const postsCollectionRef = collection(userDocRef, "Posts");
    const postDocRef = doc(postsCollectionRef, formDataWithImage.serviceTitle);
    await setDoc(postDocRef, formDataWithImage);

  } catch(error){
    throw new Error("Error creating post");
  }
};

const fetchUserPosts = (userId, callback) => {
  if (userId===null) return;

  const q = query(collection(database, `users/${userId}/Posts`));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const postsData = [];
    querySnapshot.forEach((doc) => {
      postsData.push(doc.data());
    });

    callback(postsData);
  });

  return unsubscribe;
};

const fetchUserFeed = (userId, callback) =>{
  if (userId===null) return;

  const q = query(collection(database, `users`));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const postsData = [];
    querySnapshot.forEach((doc) => {
      postsData.push(doc.data());
    });
    callback(postsData);
  });

  return unsubscribe;
}
fetchUserFeed()

export {
  addUser,
  isUsernameUnique,
  getUserData,
  updateUserData,
  createPost,
  fetchUserPosts,
};
