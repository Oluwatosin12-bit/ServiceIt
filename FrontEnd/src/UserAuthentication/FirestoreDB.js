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
  deleteDoc,
  updateDoc,
  writeBatch,
  FieldValue,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { generateRandomID } from "../BookingPage/BookingDB";
import { v4 } from "uuid";

const DATABASE_FOLDER_NAME = "users";
const POSTS_COLLECTION = "Posts";
const POST_CATEGORIES_FOLDER_NAME = "postCategories";
const LOCATION_FOLDER_NAME = "serviceLocations";
const ACTION_COUNTS = 0;
const COUNT_CHANGE = 1;
async function addUser(
  userID,
  name,
  userName,
  signUpEmail,
  selectedCategories,
  userLocation
) {
  const userDocRef = doc(database, DATABASE_FOLDER_NAME, userID);
  return await setDoc(userDocRef, {
    userID: userID,
    Name: name,
    UserName: userName,
    Email: signUpEmail,
    selectedCategories: selectedCategories ?? [],
    feedCategories: selectedCategories ?? [],
    selectedCategories: selectedCategories ?? [],
    feedCategories: selectedCategories ?? [],
    UserLocation: userLocation,
    FavoriteCount: ACTION_COUNTS,
    AppointmentCount: ACTION_COUNTS,
    Bio: "I am an amazing service provider",
    PostCount: ACTION_COUNTS,
  });
}

async function isDatabaseExist() {
  const usersCollection = query(collection(database, DATABASE_FOLDER_NAME));
  const querySnapshot = await getDocs(usersCollection);
  return !querySnapshot.empty;
}

async function isUsernameUnique(username) {
  const databaseExists = await isDatabaseExist(DATABASE_FOLDER_NAME);
  if (!databaseExists) {
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

const processServiceCategories = async (
  categories,
  batchWrite,
  formDataWithImage,
  generatedID
) => {
  const categoryPromises = categories.map(async (category) => {
    const categoryDocRef = doc(database, POST_CATEGORIES_FOLDER_NAME, category);
    const categoryDocSnap = await getDoc(categoryDocRef);

    if (!categoryDocSnap.exists()) {
      batchWrite.set(categoryDocRef, { categoryName: category, Posts: [] });
    }

    const categoryPostsCollectionRef = collection(
      categoryDocRef,
      POSTS_COLLECTION
    );
    const categoryPostDocRef = doc(categoryPostsCollectionRef, generatedID);
    batchWrite.set(categoryPostDocRef, formDataWithImage);
  });

  await Promise.all(categoryPromises);
};

const processServiceLocations = async (
  locations,
  batchWrite,
  formDataWithImage,
  generatedID
) => {
  const locationPromises = locations.map(async (location) => {
    const locationDocRef = doc(database, LOCATION_FOLDER_NAME, location);
    const locationDocSnap = await getDoc(locationDocRef);

    if (!locationDocSnap.exists()) {
      batchWrite.set(locationDocRef, { locationName: location, Posts: [] });
    }

    const locationPostsCollectionRef = collection(
      locationDocRef,
      POSTS_COLLECTION
    );
    const locationPostDocRef = doc(locationPostsCollectionRef, generatedID);
    batchWrite.set(locationPostDocRef, formDataWithImage);
  });

  await Promise.all(locationPromises);
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
      vendorEmail: userData.Email,
      vendorUID: userID,
      vendorName: userData.Name,
      postID: generatedID,
      FavoriteCount: ACTION_COUNTS,
      AppointmentCount: ACTION_COUNTS,
    };

    if (userID === null) {
      throw new Error(`Invalid user ID: ${error.message}`);
    }
    const batchWrite = writeBatch(database);

    //add to user collection
    const userDocRef = doc(database, DATABASE_FOLDER_NAME, userID);
    const postDocRef = doc(
      collection(userDocRef, POSTS_COLLECTION),
      generatedID
    );
    batchWrite.set(postDocRef, formDataWithImage);

    //increase postCount
    const userDocSnap = await getDoc(userDocRef);
    const postCount = userDocSnap.data().PostCount;
    batchWrite.update(userDocRef, { PostCount: postCount + COUNT_CHANGE });

    //add to postCategories collection
    for (const category of formData.serviceCategories) {
      const categoryDocRef = doc(
        database,
        POST_CATEGORIES_FOLDER_NAME,
        category
      );
      const categoryDocSnap = await getDoc(categoryDocRef);

      if (!categoryDocSnap.exists()) {
        batchWrite.set(categoryDocRef, { categoryName: category, Posts: [] });
      }

      const categoryPostsCollectionRef = collection(
        categoryDocRef,
        POSTS_COLLECTION
      );
      const categoryPostDocRef = doc(categoryPostsCollectionRef, generatedID);
      batchWrite.set(categoryPostDocRef, formDataWithImage);
    }

    //add to Location collection
    for (const location of formData.serviceLocations) {
      const locationDocRef = doc(database, LOCATION_FOLDER_NAME, location);
      const categoryDocSnap = await getDoc(locationDocRef);

      if (!categoryDocSnap.exists()) {
        batchWrite.set(locationDocRef, { locationName: location, Posts: [] });
      }

      const categoryPostsCollectionRef = collection(
        locationDocRef,
        POSTS_COLLECTION
      );
      const categoryPostDocRef = doc(categoryPostsCollectionRef, generatedID);
      batchWrite.set(categoryPostDocRef, formDataWithImage);
    }
    await processServiceCategories(
      formData.serviceCategories,
      batchWrite,
      formDataWithImage,
      generatedID
    );
    await processServiceLocations(
      formData.serviceLocations,
      batchWrite,
      formDataWithImage,
      generatedID
    );
    await batchWrite.commit();
  } catch (error) {
    throw new Error(`Error creating post: ${error.message}`);
  }
};

const deletePost = (userUID, postID) => {
  const favoritesRef = collection(
    database,
    DATABASE_FOLDER_NAME,
    userUID,
    POSTS_COLLECTION
  );
  const postDocRef = doc(favoritesRef, postID);
  deleteDoc(postDocRef);
};

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

    callback(postsData.sort((a, b) => b.createdAt - a.createdAt));
  });
  return unsubscribe;
};

export {
  addUser,
  isUsernameUnique,
  getUserData,
  createPost,
  fetchUserPosts,
  deletePost,
};
