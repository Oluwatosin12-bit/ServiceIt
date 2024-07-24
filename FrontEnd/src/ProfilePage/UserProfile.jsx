import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { logOutUser } from "../UserAuthentication/Auth";
import { createPost, fetchUserPosts } from "../UserAuthentication/FirestoreDB";
import Modal from "../Modal";
import { CATEGORIES } from "../Categories";
import PostFullDisplay from "../HomePage/PostFullDisplay";
import { fetchLocations, handleDeletePost } from "../UseableFunctions";
import { EditProfile } from "./EditingProfile";
import { useTheme } from "../UseContext";
import "./UserProfile.css";

function UserProfilePage({ userUID, userData }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [imageUpload, setImageUpload] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isCreatePostModalShown, setIsCreatePostModalShown] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [availableCategories] = useState(CATEGORIES);
  const [newCategory, setNewCategory] = useState("");
  const [searchLocationTerm, setSearchLocationTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostDetailModalShown, setIsPostDetailModalShown] = useState(false);
  const MINIMUM_SEARCH_WORD = 2;
  const [isSignOutDropdownVisible, setIsSignOutDropdownVisible] =
    useState(false);
  const [isDeletePostDropdownVisible, setIsDeletePostDropdownVisible] =
    useState(false);
  const signOutDropdownRef = useRef(null);
  const deletePostDropdownRef = useRef({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditProfileModalShown, setIsEditProfileModalShown] = useState(false);
  const handleClickEditProfile = () => {
    setIsEditingProfile(true);
    setIsEditProfileModalShown(true);
  };

  const toggleSignOutDropdown = () => {
    setIsSignOutDropdownVisible(!isSignOutDropdownVisible);
  };
  const toggleDeletePostDropdown = (index) => {
    setIsDeletePostDropdownVisible(
      isDeletePostDropdownVisible === index ? null : index
    );
  };
  const toggleCreatePostModal = () => {
    setIsCreatePostModalShown(!isCreatePostModalShown);
  };
  const toggleOpenPostModal = (post) => {
    setSelectedPost(post);
    setIsPostDetailModalShown(!isPostDetailModalShown);
  };

  useEffect(() => {
    if (searchLocationTerm.length >= MINIMUM_SEARCH_WORD) {
      fetchLocations(searchLocationTerm, setSearchSuggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchLocationTerm]);

  const addLocation = (location) => {
    setSelectedLocations([...selectedLocations, location]);
    setSearchLocationTerm("");
    setSearchSuggestions([]);
  };

  const removeLocation = (index) => {
    const updatedLocations = [...selectedLocations];
    updatedLocations.splice(index, 1);
    setSelectedLocations(updatedLocations);
  };

  const removeCategory = (category) => {
    setServiceCategories(
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
    setServiceCategories([...serviceCategories, ...newCategories]);
  };
  const addCategory = () => {
    if (newCategory.trim() !== "" && !serviceCategories.includes(newCategory)) {
      setServiceCategories([...serviceCategories, newCategory]);
      setNewCategory("");
    }
  };
  const [formData, setFormData] = useState({
    serviceCategories: [],
    serviceTitle: "",
    serviceDescription: "",
    servicePrice: "",
    serviceLocations: [],
    serviceAvailability: "",
  });
  formData.serviceCategories = serviceCategories;
  formData.serviceLocations = selectedLocations;

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

  const handleClickOutside = (event) => {
    if (
      signOutDropdownRef.current !== null &&
      !signOutDropdownRef.current.contains(event.target)
    ) {
      setIsSignOutDropdownVisible(false);
    }

    for (let postId in deletePostDropdownRef.current) {
      if (
        deletePostDropdownRef.current[postId] !== null &&
        !deletePostDropdownRef.current[postId].contains(event.target)
      ) {
        setIsDeletePostDropdownVisible(null);
      }
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      setServiceCategories([]);
      setSelectedLocations([]);
      setFormData({
        serviceTitle: "",
        serviceDescription: "",
        servicePrice: "",
        serviceAvailability: "",
      });
      toggleCreatePostModal();
    } catch (error) {
      throw new Error(`Error submitting form: ${error.message}`);
    }
  };

  return (
    <div className={`userProfileSection ${theme}`}>
      <div className="userInfo">
        <div className="welcomePlace">
          <div>
            <img src="/Profile.jpeg" alt="profile avatar" />
            <div className="nameContainer" ref={signOutDropdownRef}>
              <h1>{userData?.UserName} </h1>
              <span
                className="icon ellipsisIcon"
                onClick={toggleSignOutDropdown}
              >
                <i className="fa-solid fa-ellipsis-vertical" />
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
                <i
                  className="fa-solid fa-pen-to-square"
                  onClick={handleClickEditProfile}
                />
              </span>
            </div>
            <p>{userData?.Bio}</p>
          </div>
          {isEditingProfile && (
            <EditProfile userUID={userUID} userData={userData} isEditProfileModalShown ={isEditProfileModalShown} setIsEditProfileModalShown={setIsEditProfileModalShown}/>
          )}
          <div>
            <button className="createButton" onClick={toggleCreatePostModal}>
              Create a Post
            </button>
          </div>
        </div>

        <Modal isShown={isCreatePostModalShown} onClose={toggleCreatePostModal}>
          <form onSubmit={handleFormSubmit} className="postForm">
            <div className="formGroup">
              <h2 className="formHeading">Create Post</h2>
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
            <input
              type="text"
              placeholder="Add category not listed"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={addCategory}>Add Category</button>
            <div>
              <label htmlFor="serviceLocations">Serviceable Location(s):</label>
              <input
                type="text"
                placeholder="Example: Los Angeles, Birmingham"
                name="serviceLocations"
                id="serviceLocations"
                value={searchLocationTerm}
                onChange={(event) =>
                  setSearchLocationTerm(event.target.value.trim())
                }
              />
              <div className="suggestions">
                {searchSuggestions.map((location, index) => (
                  <div
                    key={index}
                    className="suggestion"
                    onClick={() => addLocation(location.description)}
                  >
                    {location.description}
                  </div>
                ))}
              </div>
              <div className="selected-locations">
                {selectedLocations.map((location, index) => (
                  <div key={index} className="selected-location">
                    {location}
                    <span
                      className="remove-location"
                      onClick={() => removeLocation(index)}
                    >
                      x
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="serviceAvailability">Availability:</label>{" "}
              <span className="availabilityInfo">When you are available to offer this service</span>
              <input
                type="text"
                placeholder="Example: Every Thursday, through July 2024"
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
            <button
              type="submit"
              disabled={!isFormValid}
              className="createButton"
            >
              Create Post
            </button>
          </form>
        </Modal>
      </div>
      <div className="userPosts">
        <div className="userPostsPreview">
          {userPosts.map((post, index) => (
            <div
              key={index}
              className="eachPost"
              onClick={() => toggleOpenPostModal(post)}
            >
              <div className="postHeading">
                <p>{post.serviceTitle}</p>
                <span
                  className="icon ellipsisIcon"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleDeletePostDropdown(index);
                  }}
                >
                  <i className="fa-solid fa-ellipsis-vertical" />
                </span>
                {isDeletePostDropdownVisible === index && (
                  <div
                    ref={(ref) => (deletePostDropdownRef.current[index] = ref)}
                    className="deleteDropDown"
                  >
                    <ul>
                      <li
                        onClick={(event) =>
                          handleDeletePost(event, userUID, post.postID)
                        }
                      >
                        Delete Post
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <img src={post.imageURL} alt="post photo" />
            </div>
          ))}
          {isPostDetailModalShown && selectedPost !== null && (
            <div>
              <PostFullDisplay
                userUID={userUID}
                post={selectedPost}
                isShown={isPostDetailModalShown}
                onClose={toggleOpenPostModal}
                userData={userData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
