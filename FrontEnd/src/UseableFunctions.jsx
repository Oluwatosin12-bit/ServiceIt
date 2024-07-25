import { deletePost } from "./UserAuthentication/FirestoreDB";
import { getDoc } from "firebase/firestore";
const fetchLocations = (query, setSuggestions) => {
  fetch(
    `https://serviceitbackend.onrender.com/places-autocomplete?input=${query}`
  )
    .then((response) => response.json())
    .then((data) => {
      setSuggestions(data.predictions);
    })
    .catch((error) => {
      setSuggestions([]);
      throw new Error("Error fetching locations:", error);
    });
};

const handleDeletePost = async (event, userUID, postID) => {
  event.stopPropagation();
  try {
    const isDeletePostConfirmation = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (isDeletePostConfirmation === true) {
      deletePost(userUID, postID);
    }
  } catch (error) {
    throw new Error(`Error deleting Post ${error.message}`);
  }
};

const updateAppointmentCount = async (docRef, COUNT_CHANGE, batchWrite) => {
  const docSnap = await getDoc(docRef);
  const appointmentCount = docSnap.data().AppointmentCount;
  batchWrite.update(docRef, {
    AppointmentCount: appointmentCount + COUNT_CHANGE,
  });
};

const updateFavoriteCount = async (docRef, COUNT_CHANGE, batchWrite) => {
  const docSnap = await getDoc(docRef);
  const favoriteCount = docSnap.data().FavoriteCount;
  batchWrite.update(docRef, { FavoriteCount: favoriteCount + COUNT_CHANGE });
};

export {
  fetchLocations,
  handleDeletePost,
  updateAppointmentCount,
  updateFavoriteCount,
};
