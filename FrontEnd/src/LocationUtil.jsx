import { database } from "./UserAuthentication/FirebaseConfig";
import {collection} from "firebase/firestore"

const DATABASE_FOLDER_NAME = "users";
export const updateUserLocation = async (userUID, city, state) => {
  try {
    const userDocRef = collection(database, DATABASE_FOLDER_NAME, userUID);
    await userDocRef.update({
      UserLocation: `${city}, ${state}`,
    });
  } catch (error) {
    throw new Error(`Unable to update user's location: ${error.message}`);
  }
};

export const fetchAndUpdateUserLocation = async (userUID) => {
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        //Do reverse Geocoding to get city and state
      });
    }
  } catch (error) {
    throw new Error(`Unable to fetch user's location: ${error.message}`);
  }
};
