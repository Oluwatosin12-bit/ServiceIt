import { database } from "../UserAuthentication/FirebaseConfig";
import {
  query,
  where,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { getUserData } from "../UserAuthentication/FirestoreDB";

const DATABASE_FOLDER_NAME = "users";
const POST_CATEGORIES_FOLDER = "postCategories";
const POSTS_COLLECTION = "Posts";
const FAVORITES_COLLECTION = "Favorites";
const APPOINTMENT_COLLECTION = "Appointments";

const feedCategory = async (userID, categories) => {
  const userDocRef = doc(database, DATABASE_FOLDER_NAME, userID);

  const docSnap = await getDoc(userDocRef);
  let currentCategories = [];
  if (docSnap.exists()) {
    const userData = docSnap.data();
    currentCategories = userData.feedCategories || [];
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

const recommendedVendors = async (userID, vendorID) => {
  const userDocRef = doc(database, DATABASE_FOLDER_NAME, userID);
  const docSnap = await getDoc(userDocRef);
  let currentRecommendedVendors = [];
  if (docSnap.exists()) {
    const userData = docSnap.data();
    currentRecommendedVendors = userData.recommendedVendors || [];

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

const addToFavoriteDocs = async (userUID, favorited, post) => {
  const favoritesRef = collection(
    database,
    DATABASE_FOLDER_NAME,
    userUID,
    FAVORITES_COLLECTION
  );
  const postDocRef = doc(favoritesRef, post.postId);

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

const postsFromFavorites = async (userUID) => {
  try {
    const favoritesRef = collection(
      database,
      DATABASE_FOLDER_NAME,
      userUID,
      FAVORITES_COLLECTION
    );
    const favoritePosts = await getDocs(favoritesRef);
    const favoriteVendorsID = [];

    for (const favoriteDoc of favoritePosts.docs) {
      const vendorID = favoriteDoc.data().post.vendorUID;
      if (vendorID !== null) {
        favoriteVendorsID.push(vendorID);
      }
    }

    return favoriteVendorsID;
  } catch (error) {
    throw new Error(
      `Error fetching posts from favorite vendors ${error.message}`
    );
  }
};

const postsFromAppointments = async (userUID) => {
  try {
    const appointmentRef = collection(
      database,
      DATABASE_FOLDER_NAME,
      userUID,
      APPOINTMENT_COLLECTION
    );
    const appointmentPosts = await getDocs(appointmentRef);
    const scheduledAppointmentVendorsID = [];

    for (const appointmentDoc of appointmentPosts.docs) {
      const vendorID = appointmentDoc.data().vendorUID;
      if (vendorID !== null) {
        scheduledAppointmentVendorsID.push(vendorID);
      }
    }

    return scheduledAppointmentVendorsID;
  } catch (error) {
    throw new Error(
      `Error fetching posts from scheduled appoinment vendors ${error.message}`
    );
  }
};

const fetchUserFeed = async (userID) => {
  if (userID === null) {
    return;
  }
  const allPosts = [];
  const uniquePosts = new Set();
  const userData = await getUserData(userID);
  const userFeedCategories = userData.feedCategories || [];
  const approvedVendorsID = userData.recommendedVendors || [];

  //posts by recommended Category
  for (const categoryID of userFeedCategories) {
    const categoryRef = doc(database, POST_CATEGORIES_FOLDER, categoryID);
    const categoryDoc = await getDoc(categoryRef);

    if (categoryDoc.exists()) {
      const postsQuery = query(collection(categoryRef, POSTS_COLLECTION));
      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.forEach((postDoc) => {
        const postID = postDoc.id
        if(uniquePosts.has(postID) === false){
          uniquePosts.add(postID)
          allPosts.push(postDoc.data());
        }
      });
    }
  }

  //posts by recommended vendors
  for (const vendorID of approvedVendorsID) {
    const vendorCollectionRef = collection(
      database,
      DATABASE_FOLDER_NAME,
      vendorID,
      POSTS_COLLECTION
    );
    const vendorPosts = await getDocs(vendorCollectionRef);
    vendorPosts.forEach((vendorPost) => {
      const vendorPostID = vendorPost.id
      if(uniquePosts.has(vendorPostID) === false){
        uniquePosts.add(vendorPostID)
        allPosts.push(vendorPost.data());
      }
    });
  }

  allPosts.sort((a, b) => b.createdAt - a.createdAt);
  return allPosts;
};

export {
  fetchUserFeed,
  feedCategory,
  addToFavoriteDocs,
  postsFromFavorites,
  isLiked,
  recommendedVendors,
};
