import {
  query,
  collection,
  doc,
  getDocs,
  getDoc,
} from "firebase/firestore";

const POST_CATEGORIES_FOLDER_NAME = "postCategories"

export const CATEGORIES = [
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

const fetchCategoryNames = async() =>{
  const categoryDocRef = collection(database, POST_CATEGORIES_FOLDER_NAME);

  try{
    const querySnapshot = await getDocs(categoryDocRef);
    const newCategories = [...CATEGORIES]
    if (querySnapshot.empty) {
      return CATEGORIES;
    }

    querySnapshot.forEach((doc) => {
      const categoryName = doc.id;
      if (newCategories.includes(categoryName) === false) {
        newCategories.push(categoryName);
      }
    });
    return newCategories;
  } catch (error) {
    return CATEGORIES;
  }

}

export default fetchCategoryNames;
