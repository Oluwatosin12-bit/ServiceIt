import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { logOutUser } from "../UserAuthentication/Auth";
import {
  createPost,
  fetchUserPosts,
  deletePost,
} from "../UserAuthentication/FirestoreDB";
import Modal from "../Modal";
import { CATEGORIES } from "../Categories";
import { useTheme } from "../UseContext";
import "./UserProfile.css";
import "https://kit.fontawesome.com/61795c539b.js";

function UserProfilePage({ userUID, userData }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [imageUpload, setImageUpload] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isCreatePostModalShown, setIsCreatePostModalShown] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [serviceCategories, setSelectedCategories] = useState([]);
  const [availableCategories] = useState(CATEGORIES);
  const [isSignOutDropdownVisible, setisSignOutDropdownVisible] =
    useState(false);
  const [isDeletePostDropdownVisible, setisDeletePostDropdownVisible] =
    useState(false);
  const signOutDropdownRef = useRef(null);
  const deletePostDropdownRef = useRef([]);

  const toggleSignOutDropdown = () => {
    setisSignOutDropdownVisible(!isSignOutDropdownVisible);
  };
  const toggleDeletePostDropdown = (index) => {
    setisDeletePostDropdownVisible(
      isDeletePostDropdownVisible === index ? null : index
    );
  };
  const handleClickOutside = (event) => {
    if (
      signOutDropdownRef.current &&
      !signOutDropdownRef.current.contains(event.target)
    ) {
      setisSignOutDropdownVisible(false);
    } else if (
      deletePostDropdownRef.current &&
      !deletePostDropdownRef.current.contains(event.target)
    ) {
      setisDeletePostDropdownVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const removeCategory = (category) => {
    setSelectedCategories(
      serviceCategories.filter(
        (serviceCategory) => serviceCategory !== category
      )
    );
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
    setIsCreatePostModalShown(!isCreatePostModalShown);
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

  const handleDeletePost = async (userUID, postID) => {
    try {
      const deletePostConfirmation = window.confirm(
        "Are you sure you want to delete this post?"
      );
      if (deletePostConfirmation === true) {
        await deletePost(userUID, postID);
      }
    } catch (error) {
      throw new Error(`Error deleting Post ${error.message}`);
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
    <div className={`userProfileSection ${theme}`}>
      <div className="userInfo">
        <div className="welcomePlace">
          <div>
            <img src="src/Images/Profile.jpeg" alt="profile avatar" />
            <div className="nameContainer" ref={signOutDropdownRef}>
              <h1>{userData?.UserName} </h1>
              <span
                className="icon ellipsisIcon"
                onClick={toggleSignOutDropdown}
              >
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </span>
              {isSignOutDropdownVisible && (
                <div className="dropdownMenu">
                  <ul>
                    <li onClick={handleLogOut}>Sign Out</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="bioContainer">
              <p>Bio:</p>
              <span className="icon editIcon">
                <i className="fa-solid fa-pen-to-square"></i>
              </span>
            </div>
            <p>I am an amazing service provider</p>
          </div>
          <div>
            <button className="createButton" onClick={toggleModal}>
              Create a Post
            </button>
          </div>
        </div>

        <Modal isShown={isCreatePostModalShown} onClose={toggleModal}>
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
      <div className="userPosts">
        <div className="userPostsPreview">
          {userPosts.map((post, index) => {
            return (
              <div key={index} className="eachPost">
                <div
                  className="postHeading"
                  ref={(ref) => (deletePostDropdownRef.current[index] = ref)}
                >
                  <p>{post.serviceTitle}</p>
                  <span
                    className="icon ellipsisIcon"
                    onClick={() => toggleDeletePostDropdown(index)}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </span>
                  {isDeletePostDropdownVisible === index && (
                    <div className="dropdownMenu">
                      <ul>
                        <li
                          onClick={() => handleDeletePost(userUID, post.postID)}
                        >
                          Delete Post
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <img src={post.imageURL} alt="post photo" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
