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
import {
  updateFavoriteCount,
  updateAppointmentCount,
} from "../UseableFunctions";

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
    currentCategories = userData.feedCategories ?? [];
  }

  categories.forEach((category) => {
    if (!currentCategories.includes(category)) {
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

    if (!currentRecommendedVendors.includes(vendorID)) {
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

  const updateFavoriteCounts = async (
    items,
    refPathPrefix,
    favorited,
    batchWrite
  ) => {
    await Promise.all(
      items.map(async (item) => {
        const itemPostRef = doc(
          database,
          refPathPrefix,
          item,
          POSTS_COLLECTION,
          postID
        );
        const countChange = favorited ? -COUNT_CHANGE : COUNT_CHANGE;
        await updateFavoriteCount(itemPostRef, countChange, batchWrite);
      })
    );
  };

  await updateFavoriteCounts(
    post.serviceCategories,
    POST_CATEGORIES_FOLDER,
    favorited,
    batchWrite
  );
  await updateFavoriteCounts(
    post.serviceLocations,
    LOCATION_FOLDER_NAME,
    favorited,
    batchWrite
  );

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

  const updateAppointmentCounts = async (
    items,
    refPathPrefix,
    countChange,
    batchWrite
  ) => {
    await Promise.all(
      items.map(async (item) => {
        const itemPostRef = doc(
          database,
          refPathPrefix,
          item,
          POSTS_COLLECTION,
          postID
        );
        await updateAppointmentCount(itemPostRef, countChange, batchWrite);
      })
    );
  };

  await updateAppointmentCounts(
    post.serviceCategories,
    POST_CATEGORIES_FOLDER,
    COUNT_CHANGE,
    batchWrite
  );
  await updateAppointmentCounts(
    post.serviceLocations,
    LOCATION_FOLDER_NAME,
    COUNT_CHANGE,
    batchWrite
  );

  try {
    await batchWrite.commit();
  } catch (error) {
    throw new Error("Batch update failed:", error);
  }
};

const filterByCategory = async (userID, category) => {
  const posts = [];
  const uniquePosts = new Set();
  const categoryCollectionRef = collection(
    database,
    POST_CATEGORIES_FOLDER,
    category,
    POSTS_COLLECTION
  );
  const categoryQuery = query(categoryCollectionRef);
  const categoryDocs = await getDocs(categoryQuery);
  categoryDocs.forEach((post) => {
    const postID = post.id;
    if (!uniquePosts.has(postID) && post.vendorUID !== userID) {
      uniquePosts.add(postID);
      posts.push(post.data());
    }
  });
  return posts;
};

const fetchPostsFromCategories = async (categories, uniquePosts) => {
  const postsPromises = categories.map(async (categoryID) => {
    const categoryRef = doc(database, POST_CATEGORIES_FOLDER, categoryID);
    const categoryDoc = await getDoc(categoryRef);

    if (categoryDoc.exists()) {
      const postsQuery = query(collection(categoryRef, POSTS_COLLECTION));
      const postsSnapshot = await getDocs(postsQuery);
      return postsSnapshot.docs
        .filter(
          (postDoc) =>
            !uniquePosts.has(postDoc.id) && postDoc.data().vendorUID !== userID
        )
        .map((postDoc) => {
          uniquePosts.add(postDoc.id);
          return postDoc.data();
        });
    }
    return [];
  });

  const results = await Promise.all(postsPromises);
  return results.flat();
};

const fetchPostsFromVendors = async (
  vendors,
  uniquePosts,
  userLocation,
  userID
) => {
  const REC_VENDOR_CUTOFF_SCORE = 30;
  const SIMILAR_LOCATION_SCORE = 40;
  const FAVORITE_OVERALL_SCORE = 13;
  const APPOINTMENT_OVERALL_SCORE = 30;
  const POSTCOUNT_OVERALL_SCORE = 17;
  const MULTIPLICAND = 0.99;

  const vendorPostsPromises = vendors.map(async (vendorID) => {
    const vendorCollectionRef = doc(database, DATABASE_FOLDER_NAME, vendorID);
    const vendorCollectionSnap = await getDoc(vendorCollectionRef);

    if (vendorCollectionSnap.exists()) {
      const vendorData = vendorCollectionSnap.data();
      const favoriteScore = vendorData.FavoriteCount * MULTIPLICAND;
      const appointmentScore = vendorData.AppointmentCount * MULTIPLICAND;
      const postCountScore = vendorData.PostCount * MULTIPLICAND;

      let accountScore = 0;
      accountScore += Math.min(favoriteScore, FAVORITE_OVERALL_SCORE);
      accountScore += Math.min(appointmentScore, APPOINTMENT_OVERALL_SCORE);
      accountScore += Math.min(postCountScore, POSTCOUNT_OVERALL_SCORE);

      const vendorPostRef = collection(vendorCollectionRef, POSTS_COLLECTION);
      const vendorPostsSnapshot = await getDocs(vendorPostRef);
      return vendorPostsSnapshot.docs
        .filter((vendorPost) => {
          const vendorPostID = vendorPost.id;
          const vendorServiceLocations = vendorPost.data().serviceLocations;
          if (vendorServiceLocations.includes(userLocation)) {
            accountScore += SIMILAR_LOCATION_SCORE;
          }
          return (
            !uniquePosts.has(vendorPostID) &&
            vendorPost.data().vendorUID !== userID &&
            accountScore > REC_VENDOR_CUTOFF_SCORE
          );
        })
        .map((vendorPost) => {
          uniquePosts.add(vendorPost.id);
          return vendorPost.data();
        });
    }
    return [];
  });

  const results = await Promise.all(vendorPostsPromises);
  return results.flat();
};

const fetchUserFeed = async (userID) => {
  if (userID === null) {
    return;
  }
  const uniquePosts = new Set();
  const userData = await getUserData(userID);
  const userLocation = userData?.UserLocation;
  const userFeedCategories = userData.feedCategories ?? [];
  const approvedVendorsID = userData.recommendedVendors ?? [];

  const categoryPosts = await fetchPostsFromCategories(
    userFeedCategories,
    uniquePosts
  );
  const vendorPosts = await fetchPostsFromVendors(
    approvedVendorsID,
    uniquePosts,
    userLocation,
    userID
  );

  const allPosts = [...categoryPosts, ...vendorPosts];

  //post by nearest location
  const locationPostRef = doc(database, LOCATION_FOLDER_NAME, userLocation);
  const locationDocRef = await getDoc(locationPostRef);
  if (locationDocRef.exists()) {
    const postQuery = query(collection(locationDocRef, POSTS_COLLECTION));
    const postsSnapshot = await getDocs(postQuery);
    postsSnapshot.forEach((postDoc) => {
      const postID = postDoc.id;
      if (!uniquePosts.has(postID) && postDoc.data().vendorUID !== userID) {
        uniquePosts.add(postID);
        allPosts.push(postDoc.data());
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
  isLiked,
  getRecommendedVendors,
  updateVendorPostLikes,
  updateVendorPostAppointment,
  filterByCategory,
};
