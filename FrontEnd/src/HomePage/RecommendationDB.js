import { database } from "../UserAuthentication/FirebaseConfig";
import {
  query,
  where,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  deleteDoc,
  getDoc,
  onSnapshot,
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import { getUserData } from "../UserAuthentication/FirestoreDB";
import { updateFavoriteCount, updateAppointmentCount } from "../UseableFunctions";

const DATABASE_FOLDER_NAME = "users";
const POST_CATEGORIES_FOLDER = "postCategories";
const POSTS_COLLECTION = "Posts";
const FAVORITES_COLLECTION = "Favorites";
const APPOINTMENT_COLLECTION = "Appointments";
const LOCATION_FOLDER_NAME = "serviceLocations";
const COUNT_CHANGE = 1;

//recommended categories + user interest
const feedCategory = async (userID, categories) => {
  const userDocRef = doc(database, DATABASE_FOLDER_NAME, userID);

  const docSnap = await getDoc(userDocRef);
  let currentCategories = [];
  if (docSnap.exists()) {
    const userData = docSnap.data();
    currentCategories = userData.feedCategories ?? [];
  }

  categories.forEach((category) => {
    if (currentCategories.includes(category) === false) {
      currentCategories.push(category);
    }
  });

  return await setDoc(
    userDocRef,
    {
      feedCategories: currentCategories,
    },
    { merge: true }
  );
};

const addToFavoriteDocs = async (userUID, favorited, post) => {
  const favoritesRef = collection(
    database,
    DATABASE_FOLDER_NAME,
    userUID,
    FAVORITES_COLLECTION
  );
  const postDocRef = doc(favoritesRef, post.postID);

  if (favorited === true) {
    await deleteDoc(postDocRef);
  } else {
    await setDoc(postDocRef, {
      post,
      likedAt: new Date(),
    });
  }
};

const isLiked = (userUID, postID, callback) => {
  const favoritesRef = collection(
    database,
    DATABASE_FOLDER_NAME,
    userUID,
    FAVORITES_COLLECTION
  );
  const q = query(favoritesRef, where("post.postID", "==", postID));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    callback(!querySnapshot.empty);
  });

  return unsubscribe;
};

//vendors users have interacted with in some way (by likes or appointments)
const getRecommendedVendors = async (userID, vendorID) => {
  const userDocRef = doc(database, DATABASE_FOLDER_NAME, userID);
  const docSnap = await getDoc(userDocRef);
  let currentRecommendedVendors = [];
  if (docSnap.exists()) {
    const userData = docSnap.data();
    currentRecommendedVendors = userData.recommendedVendors ?? [];

    if (currentRecommendedVendors.includes(vendorID) === false) {
      currentRecommendedVendors.push(vendorID);
      await updateDoc(userDocRef, {
        recommendedVendors: currentRecommendedVendors,
      });
    }
  } else {
    await setDoc(userDocRef, { recommendedVendors: [vendorID] });
  }
};

//likes on a post
const updateVendorPostLikes = async (post, favorited) => {
  const batchWrite = writeBatch(database);
  const postID = post.postID;
  const vendorDocRef = doc(database, DATABASE_FOLDER_NAME, post.vendorUID);
  const vendorPostDocRef = doc(vendorDocRef, POSTS_COLLECTION, postID);

  if (favorited === true) {
    await updateFavoriteCount(vendorDocRef, -COUNT_CHANGE, batchWrite);
    await updateFavoriteCount(vendorPostDocRef, -COUNT_CHANGE, batchWrite);
  } else {
    await updateFavoriteCount(vendorDocRef, COUNT_CHANGE, batchWrite);
    await updateFavoriteCount(vendorPostDocRef, COUNT_CHANGE, batchWrite);
  }

  for (const category of post.serviceCategories) {
    const categoryPostRef = doc(
      database,
      POST_CATEGORIES_FOLDER,
      category,
      POSTS_COLLECTION,
      postID
    );
    if (favorited === true) {
      await updateFavoriteCount(categoryPostRef, -COUNT_CHANGE, batchWrite);
    } else {
      await updateFavoriteCount(categoryPostRef, COUNT_CHANGE, batchWrite);
    }
  }

  for (const location of post.serviceLocations) {
    const locationPostRef = doc(
      database,
      LOCATION_FOLDER_NAME,
      location,
      POSTS_COLLECTION,
      postID
    );
    if (favorited === true) {
      await updateFavoriteCount(locationPostRef, -COUNT_CHANGE, batchWrite);
    } else {
      await updateFavoriteCount(locationPostRef, COUNT_CHANGE, batchWrite);
    }
  }
  await batchWrite.commit();
};

//number of appointments on a post
const updateVendorPostAppointment = async (post) => {
  const batchWrite = writeBatch(database);
  const postID = post.postID;
  const vendorDocRef = doc(database, DATABASE_FOLDER_NAME, post.vendorUID);
  await updateAppointmentCount(vendorDocRef, COUNT_CHANGE, batchWrite);

  const vendorPostDocRef = doc(vendorDocRef, POSTS_COLLECTION, postID);
  await updateAppointmentCount(vendorPostDocRef, COUNT_CHANGE, batchWrite);

  for (const category of post.serviceCategories) {
    const categoryPostRef = doc(
      database,
      POST_CATEGORIES_FOLDER,
      category,
      POSTS_COLLECTION,
      postID
    );
    await updateAppointmentCount(categoryPostRef, COUNT_CHANGE, batchWrite);
  }

  for (const location of post.serviceLocations) {
    const locationPostRef = doc(
      database,
      LOCATION_FOLDER_NAME,
      location,
      POSTS_COLLECTION,
      postID
    );
    await updateAppointmentCount(locationPostRef, COUNT_CHANGE, batchWrite);
  }

  try {
    await batchWrite.commit();
  } catch (error) {
    throw new Error("Batch update failed:", error);
  }
};

const fetchUserFeed = async (userID) => {
  if (userID === null) {
    return;
  }
  const allPosts = [];
  const postScore = 0;
  const CUTOFF_SCORE = 7;
  const uniquePosts = new Set();
  const userData = await getUserData(userID);
  const userLocation =  userData?.UserLocation
  const userFeedCategories = userData.feedCategories ?? [];
  const approvedVendorsID = userData.recommendedVendors ?? [];

  //posts by recommended Category
  for (const categoryID of userFeedCategories) {
    const categoryRef = doc(database, POST_CATEGORIES_FOLDER, categoryID);
    const categoryDoc = await getDoc(categoryRef);

    if (categoryDoc.exists()) {
      const postsQuery = query(collection(categoryRef, POSTS_COLLECTION));
      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.forEach((postDoc) => {
        const postID = postDoc.id;
        if (uniquePosts.has(postID) === false && postDoc.vendorUID !== userID) {
          uniquePosts.add(postID);
          allPosts.push(postDoc.data());
        }
      });
    }
  }

  //posts by recommended vendors (if they meet weightScore)
  for (const vendorID of approvedVendorsID) {
    const vendorCollectionRef = collection(
      database,
      DATABASE_FOLDER_NAME,
      vendorID,
      POSTS_COLLECTION
    );
    const vendorPosts = await getDocs(vendorCollectionRef);
    vendorPosts.forEach((vendorPost) => {
      const vendorPostID = vendorPost.id;
      if (uniquePosts.has(vendorPostID) === false && vendorPost.vendorUID !== userID) {
        uniquePosts.add(vendorPostID);
        allPosts.push(vendorPost.data());
      }
    });
  }

  //post by nearest location
  const locationPostRef = doc(database, LOCATION_FOLDER_NAME, userLocation)
  const locationDocRef = await getDoc(locationPostRef)
  if(locationDocRef.exists()){
    const postQuery = query(collection(locationDocRef, POSTS_COLLECTION));
    const postsSnapshot = await getDocs(postQuery);
    postsSnapshot.forEach((postDoc)=>{
      const postID = postDoc.id;
        if (uniquePosts.has(postID) === false && postDoc.vendorUID !== userID) {
          uniquePosts.add(postID);
          allPosts.push(postDoc.data());
        }
    })
  }


  allPosts.sort((a, b) => b.createdAt - a.createdAt);
  return allPosts;
};

export {
  fetchUserFeed,
  feedCategory,
  addToFavoriteDocs,
  isLiked,
  getRecommendedVendors,
  updateVendorPostLikes,
  updateVendorPostAppointment,
};
