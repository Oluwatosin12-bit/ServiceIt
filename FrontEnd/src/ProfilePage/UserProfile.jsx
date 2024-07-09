import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logOutUser } from "../UserAuthentication/Auth";
import { createPost, fetchUserPosts } from "../UserAuthentication/FirestoreDB";
import Modal from "../Modal";
import "./UserProfile.css";

function UserProfilePage({ userUID, userData }) {
  const navigate = useNavigate();
  const [imageUpload, setImageUpload] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isShowModal, setIsShowModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [serviceCategories, setSelectedCategories] = useState([]);
  const [availableCategories] = useState([
    "Hair Styling",
    "Plumbing",
    "Fitness",
    "Cleaning",
    "Electricity",
    "Home Decor",
    "Car Repair",
    "Pet Sitting",
    "Chef",
  ]);
  const removeCategory = (category) => {
    setSelectedCategories(serviceCategories.filter((cat) => cat !== category));
  };
  const handleCategoryChange = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    const newCategories = selectedOptions.filter(
      (category) => !serviceCategories.includes(category)
    );
    setSelectedCategories([...serviceCategories, ...newCategories]);
  };
  const [formData, setFormData] = useState({
    serviceCategories: [],
    serviceTitle: "",
    serviceDescription: "",
    servicePrice: "",
    serviceLocations: "",
    serviceAvailability: "",
  });
  formData.serviceCategories = serviceCategories;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const isFormValid = Object.values(formData).every((val) => val !== "");
    setIsFormValid(isFormValid);
  }, [formData]);

  useEffect(() => {
    if (userUID === null) return;
    const unsubscribe = fetchUserPosts(userUID, (postsData) => {
      setUserPosts(postsData);
    });
    return () => unsubscribe && unsubscribe();
  }, [userUID]);

  const toggleModal = () => {
    setIsShowModal(!isShowModal);
  };

  const handleLogOut = async () => {
    try {
      const logOutConfirmation = window.confirm(
        "Are you sure you want to sign out?"
      );
      if (logOutConfirmation === true) {
        await logOutUser();
        navigate("/");
      }
    } catch (error) {
      throw new Error(`Error logging out: ${error.message}`);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await createPost(formData, imageUpload, userUID, userData);
      toggleModal();
    } catch (error) {
      throw new Error(`Error submitting form: ${error.message}`);
    }
  };

  return (
    <div className="userProfileSection">
      <div className="userInfo">
        <div className="welcomePlace">
          <div>
            <h1>{userData?.UserName} </h1>
            <p>Bio:</p>
          </div>
          <div>
            <button onClick={toggleModal}>Create a Post</button>
            <button onClick={handleLogOut}> Sign Out </button>
          </div>
        </div>

        <Modal show={isShowModal} onClose={toggleModal}>
          <form onSubmit={handleFormSubmit} className="postForm">
            <div className="formGroup">
              <label htmlFor="serviceTitle">Title:</label>
              <input
                type="text"
                placeholder="Enter Title"
                name="serviceTitle"
                id="serviceTitle"
                value={formData.serviceTitle}
                onChange={(event) => handleChange(event)}
              />
            </div>
            <div className="serviceCategories">
              {serviceCategories.map((category, index) => (
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
                <option></option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="serviceLocations">Serviceable Location(s):</label>
              <input
                type="text"
                placeholder="Example: Los Angeles, Birmingham"
                name="serviceLocations"
                id="serviceLocations"
                value={formData.serviceLocations}
                onChange={(event) => handleChange(event)}
              />
            </div>
            <div>
              <label htmlFor="serviceAvailability">Availability:</label>
              <input
                type="text"
                placeholder=""
                name="serviceAvailability"
                id="serviceAvailability"
                value={formData.serviceAvailability}
                onChange={(event) => handleChange(event)}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="servicePrice">Price Range:</label>
              <input
                type="text"
                placeholder="Enter Price range"
                name="servicePrice"
                id="servicePrice"
                value={formData.servicePrice}
                onChange={(event) => handleChange(event)}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="ImageURL">Select Image</label>
              <input
                type="file"
                name="ImageURL"
                id="ImageURL"
                onChange={(event) => setImageUpload(event.target.files[0])}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="serviceDescription">Service Description:</label>
              <textarea
                placeholder="Enter Description"
                name="serviceDescription"
                id="serviceDescription"
                value={formData.serviceDescription}
                onChange={(event) => handleChange(event)}
              />
            </div>

            <button type="submit" disabled={!isFormValid}>
              Create Post
            </button>
          </form>
        </Modal>
      </div>
      <div className="userPostsPreview">
        {userPosts.map((post, index) => {
          return (
            <div key={index}>
              <p>{post.serviceTitle}</p>
              <img src={post.imageURL} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserProfilePage;
