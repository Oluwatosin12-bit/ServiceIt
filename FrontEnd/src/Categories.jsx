import { query, collection, doc, getDocs, getDoc } from "firebase/firestore";
import { database } from "./UserAuthentication/FirebaseConfig";

const POST_CATEGORIES_FOLDER_NAME = "postCategories";

const fetchCategoryNames = async () => {
  const categoryDocRef = collection(database, POST_CATEGORIES_FOLDER_NAME);
  const CATEGORIES = [
    "Hair Styling",
    "Plumbing",
    "Fitness",
    "Cleaning",
    "Electricity",
    "Home Decor",
    "Car Repair",
    "Pet Sitting",
    "Chef",
  ];
  try {
    const querySnapshot = await getDocs(categoryDocRef);
    const newCategories = [...CATEGORIES];
    if (querySnapshot.empty) {
      return CATEGORIES;
    }

    querySnapshot.forEach((doc) => {
      const categoryName = doc.id;
      if (!newCategories.includes(categoryName)) {
        newCategories.push(categoryName);
      }
    });
    return newCategories;
  } catch (error) {
    return CATEGORIES;
  }
};

export default fetchCategoryNames;
