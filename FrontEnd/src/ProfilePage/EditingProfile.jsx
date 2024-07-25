import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "../UserAuthentication/FirebaseConfig";
import fetchCategoryNames from "../Categories";
import Modal from "../Modal";

const EditProfile = ({
  userUID,
  userData,
  isEditProfileModalShown,
  setIsEditProfileModalShown,
}) => {
  const DATABASE_FOLDER_NAME = "users";
  const userCollectionRef = doc(database, DATABASE_FOLDER_NAME, userUID);
  const [userBio, setUserBio] = useState(userData?.Bio);
  const [isLoading, setIsLoading] = useState(true);
  const [userSelectedCategories, setUserSelectedCategories] = useState(
    userData?.selectedCategories ?? []
  );
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategoryNames();
      setAvailableCategories(fetchedCategories);
    };

    loadCategories();
    setIsLoading(false);
  }, []);
  const toggleEditProfileModal = () => {
    setIsEditProfileModalShown(!isEditProfileModalShown);
  };

  const handleBioChange = (e) => {
    setUserBio(e.target.value);
  };
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    if (!userSelectedCategories.includes(selectedCategory)) {
      setUserSelectedCategories([...userSelectedCategories, selectedCategory]);
    }
  };
  const removeCategory = (category) => {
    const updatedCategories = userSelectedCategories.filter(
      (selectedCategory) => selectedCategory !== category
    );
    setUserSelectedCategories(updatedCategories);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await updateDoc(userCollectionRef, {
        Bio: userBio,
        selectedCategories: userSelectedCategories,
      });
      toggleEditProfileModal();
    } catch (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
  };

  return (
    <Modal isShown={isEditProfileModalShown} onClose={toggleEditProfileModal}>
      <div>
        <label htmlFor="bioInput">Bio</label>
        <textarea
          id="bioInput"
          value={userBio}
          onChange={handleBioChange}
          rows={4}
          cols={50}
        />
      </div>

      <div className="selectedCategories">
        <label>Selected Categories:</label>
        {userSelectedCategories.map((category, index) => (
          <div className="categoryTag" key={index}>
            {category}
            <span
              className="cancelIcon"
              onClick={() => removeCategory(category)}
            >
              ×
            </span>
          </div>
        ))}
      </div>

      <div className="availableCategories">
        <label htmlFor="categoryDropdown">Select Categories:</label>
        <select id="categoryDropdown" onChange={handleCategoryChange}>
          <option value="">Select category</option>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))
          )}
        </select>
      </div>
      <button onClick={handleSave} className="saveButton">
        Save
      </button>
    </Modal>
  );
};

export { EditProfile };
