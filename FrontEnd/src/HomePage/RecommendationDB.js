import { database } from "../UserAuthentication/FirebaseConfig";
import { query, where, collection, getDocs, doc, setDoc, updateDoc, arrayUnion, deleteDoc, getDoc, onSnapshot } from "firebase/firestore";
import { getUserData } from "../UserAuthentication/FirestoreDB";

const DATABASE_FOLDER_NAME = "users";
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

  return await setDoc(userDocRef, {
    feedCategories: currentCategories,
  }, {merge: true})
};

const addToFavoriteDocs = async(userUID, favorited, post) =>{
  const favoritesRef = collection(database, DATABASE_FOLDER_NAME, userUID, FAVORITES_COLLECTION);
  const postDocRef = doc(favoritesRef, post.postId);

  if (favorited === true) {
    await deleteDoc(postDocRef);
  } else {
    await setDoc(postDocRef, {
      post,
      likedAt: new Date(),
    });
  }
}

const checkLike = (userUID, postID, callback) =>{
  const favoritesRef = collection(database, DATABASE_FOLDER_NAME, userUID, FAVORITES_COLLECTION)
  const q = query(favoritesRef, where("post.postID", "==", postID));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    callback(!querySnapshot.empty);
});

return unsubscribe
}

const postsFromFavorites = async(userUID) =>{
  try{
    const favoritesRef = collection(database, DATABASE_FOLDER_NAME, userUID, FAVORITES_COLLECTION)
    const favoritePosts = await getDocs(favoritesRef)
    const favoriteVendorsID = []

    for (const favoriteDoc of favoritePosts.docs){
      const vendorID = favoriteDoc.data().post.vendorUID
      if (vendorID !== null){
        favoriteVendorsID.push(vendorID)
      }
    }

    return favoriteVendorsID ;
  } catch(error){
    throw new Error(`Error fetching posts from favorite vendors ${error.message}`)
  }
}

const postsFromAppointments = async(userUID) =>{
  try{
    const appointmentRef = collection(database, DATABASE_FOLDER_NAME, userUID, APPOINTMENT_COLLECTION)
    const appointmentPosts = await getDocs(appointmentRef)
    const scheduledAppointmentVendorsID = []

    for (const appointmentDoc of appointmentPosts.docs){
      const vendorID = appointmentDoc.data().vendorUID
      if (vendorID !== null){
        scheduledAppointmentVendorsID.push(vendorID)
      }
    }

    return scheduledAppointmentVendorsID ;
  } catch(error){
    throw new Error(`Error fetching posts from scheduled appoinment vendors ${error.message}`)
  }
}

const fetchUserFeed = async (userID) => {
  if (userID === null) {
    return;
  }
  const userData = await getUserData(userID);
  const userFeedCategory = userData.feedCategories || [];
  const approvedVendorsID = []
  const favoriteVendorsID = await postsFromFavorites(userID) || []
  const scheduledAppointmentVendorsID = await postsFromAppointments(userID) || []
  if (favoriteVendorsID !== null){
    approvedVendorsID.push(...favoriteVendorsID);
  }
  if (scheduledAppointmentVendorsID !== null){
    approvedVendorsID.push(...scheduledAppointmentVendorsID);
  }

  const usersSnapshot = await getDocs(
    collection(database, DATABASE_FOLDER_NAME)
  );
  const allPosts = [];
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const userPostsSnapshot = collection(
      database,
      `${DATABASE_FOLDER_NAME}/${userId}/${POSTS_COLLECTION}`
    );
    const postsSnapshot = await getDocs(userPostsSnapshot);
    postsSnapshot.forEach((postDoc) => {
      if (postDoc.exists) {
        const postData = postDoc.data();
        if (
          !userData ||
          !userData.feedCategories ||
          userData.feedCategories.length === 0
        ) {
          allPosts.push({
            userId: userId,
            postId: postDoc.id,
            ...postData,
          });
        } else {
          if (userId in approvedVendorsID || postData.serviceCategories.some(category => userFeedCategory.includes(category))){
            allPosts.push({
              userId: userId,
            postId: postDoc.id,
            ...postData,
            })
          }
        }
      }
    });
  }
  allPosts.sort((a, b) => b.createdAt - a.createdAt);
  return allPosts;
};


export { fetchUserFeed, feedCategory, addToFavoriteDocs, postsFromFavorites, checkLike };
