import { database } from "../UserAuthentication/FirebaseConfig";
import { query, where, collection, getDocs, doc, setDoc, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { getUserData } from "../UserAuthentication/FirestoreDB";

const DATABASE_FOLDER_NAME = "users";
const POSTS_COLLECTION = "Posts";

const fetchUserFeed = async (userID) => {
  if (userID === null) {
    return;
  }
  const userData = await getUserData(userID);
  const userCategoryInterest = userData.selectedCategories || [];

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
          !userData.selectedCategories ||
          userData.selectedCategories.length === 0
        ) {
          allPosts.push({
            userId: userId,
            postId: postDoc.id,
            ...postData,
          });
        } else {
          if (
            postData.serviceCategories.some((category) =>
              userCategoryInterest.includes(category)
            )
          ) {
            allPosts.push({
              userId: userId,
              postId: postDoc.id,
              ...postData,
            });
          }
        }
      }
    });
  }
  return allPosts;
};

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
  const favoritesRef = doc(database, 'users', `${userUID}`);

  if (favorited === true) {
    await deleteDoc(favoritesRef);
  } else {
    await setDoc(favoritesRef, {
      userUID,
      postUserId: post.userId,
      postTitle: post.serviceTitle,
      likedAt: new Date(),
    });
  }

}

export { fetchUserFeed, feedCategory, addToFavoriteDocs };
