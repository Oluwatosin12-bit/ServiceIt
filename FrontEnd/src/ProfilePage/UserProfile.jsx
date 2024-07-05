import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { logOutUser } from "../UserAuthentication/Auth";
import { createPost, fetchUserPosts } from "../UserAuthentication/FirestoreDB";
import "./UserProfile.css";

function UserProfilePage({ userUID, userData }) {
  const [imageUpload, setImageUpload] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    serviceCategory: "",
    serviceTitle: "",
    serviceDescription: "",
    servicePrice: "",
  });
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

  const handleLogOut = async () => {
    try {
      await logOutUser();
    } catch (error) {
      throw new Error(`Error logging out: ${error.message}`);
    }
  };
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await createPost(formData, imageUpload, userUID);
    } catch (error) {
      throw new Error(`Error submitting form: ${error.message}`);
    }
  };

  return (
    <div className="userProfileSection">
      <div>
        <div className="welcomePlace">
          <h1>{userData?.UserName} </h1>
        </div>
        <Link to="/" onClick={handleLogOut}>
          Sign Out
        </Link>
        <form onSubmit={handleFormSubmit}>
          <input
            placeholder="Enter Title"
            name="serviceTitle"
            value={formData.serviceTitle}
            onChange={(event) => handleChange(event)}
          />
          <input
            placeholder="Example: hairstyling, plumbing"
            name="serviceCategory"
            value={formData.serviceCategory}
            onChange={(event) => handleChange(event)}
          />
          <input
            placeholder="Enter Description"
            name="serviceDescription"
            value={formData.serviceDescription}
            onChange={(event) => handleChange(event)}
          />
          <input
            placeholder="Enter Price range"
            name="servicePrice"
            value={formData.servicePrice}
            onChange={(event) => handleChange(event)}
          />
          <input
            type="file"
            name="ImageURL"
            onChange={(event) => setImageUpload(event.target.files[0])}
          />
          <button type="submit" disabled={!isFormValid}>
            Create Post
          </button>
        </form>
      </div>
      <div className="userPostsPreview">
        {userPosts.map((post, index) => {
          return (
            <div key={index}>
              <p>{post.serviceCategory}</p>
              <img src={post.imageURL} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserProfilePage;
