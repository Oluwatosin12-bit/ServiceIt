import { database } from "./UserAuthentication/FirebaseConfig";
import { GOOGLE_PLACES_KEY } from "./env";
import { doc, updateDoc } from "firebase/firestore";

const DATABASE_FOLDER_NAME = "users";
export const updateUserLocation = async (userUID, city, state) => {
  const userDocRef = doc(database, DATABASE_FOLDER_NAME, userUID);
  await updateDoc(userDocRef, {
    UserLocation: `${city}, ${state}`,
  });
};

export const fetchAndUpdateUserLocation = async (userUID) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const apiKey = GOOGLE_PLACES_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

        try {
          const response = await fetch(url);
          const data = await response.json();

          if (data.status === "OK") {
            const results = data.results;
            const addressComponents = results[0].address_components;

            let city = "";
            let state = "";

            addressComponents.forEach((component) => {
              if (component.types.includes("locality")) {
                city = component.long_name;
              }
              if (component.types.includes("administrative_area_level_1")) {
                state = component.short_name;
              }
            });

            await updateUserLocation(userUID, city, state);
          } else {
            throw new Error("Geocoding API error: " + data.status);
          }
        } catch (error) {
          throw new Error("Error fetching the geocoding data:", error.message);
        }
      },
      (error) => {
        throw new Error("Error getting user location:", error.message);
      }
    );
  } else {
    throw new Error("Geolocation is not supported by this browser.");
  }
};
