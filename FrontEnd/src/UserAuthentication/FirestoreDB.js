import { database, storage } from "./FirebaseConfig";
import {
  query,
  where,
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";

async function addUser(userID, firstName, lastName, userName, signUpEmail) {
  const userDocRef = doc(database, "users", userID);
  return await setDoc(userDocRef, {
    userID: userID,
    FirstName: firstName,
    LastName: lastName,
    UserName: userName,
    Email: signUpEmail,
  });
}

async function isDatabaseExist() {
  const usersCollection = query(collection(database, "users"));
  const querySnapshot = await getDocs(usersCollection);
  return !querySnapshot.empty;
}

async function isUsernameUnique(username) {
  const databaseExists = await isDatabaseExist("users");
  if (databaseExists === false) {
    return true;
  }
  const usersCollection = collection(database, "users");
  const check = query(usersCollection, where("UserName", "==", username));
  const querySnapshot = await getDocs(check);
  return querySnapshot.empty;
}

const getUserData = async (uid) => {
  if (uid === null) {
    return;
  }
  try {
    const userDocRef = doc(database, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data();
    }
  } catch (error) {
    throw new Error("Error accessing User data");
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

const createPost = async (formData, imageUpload, userId) => {
  try {
    const imageURL = await uploadPostImage(formData.serviceCategory, imageUpload);
    const formDataWithImage = { ...formData, imageURL };

    if (userId === null) {
      throw new Error("Invalid user ID");
    }

    const userDocRef = doc(database, "users", userId);
    const postsCollectionRef = collection(userDocRef, "Posts");
    const postDocRef = doc(postsCollectionRef, formDataWithImage.serviceTitle);
    await setDoc(postDocRef, formDataWithImage);
  } catch (error) {
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

const fetchUserFeed = async(userID) =>{
  if (userID===null) return;

  const usersSnapshot = await getDocs(collection(database, `users`));
  const allPosts = [];
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const userPostsSnapshot = collection(database, `users/${userId}/Posts`);
    const postsSnapshot = await getDocs(userPostsSnapshot);
    postsSnapshot.forEach((postDoc) => {
      if (postDoc.exists) {
        allPosts.push({
          userId: userId,
          postId: postDoc.id,
          ...postDoc.data()
        });
      }
    });
  }

  return allPosts;
}

export {
  addUser,
  isUsernameUnique,
  getUserData,
  createPost,
  fetchUserPosts,
  fetchUserFeed
};
