import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logOutUser, getUID } from "../UserAuthentication/Auth";
import { createPost, getUserData, fetchUserPosts } from "../UserAuthentication/FirestoreDB";
import "./UserProfile.css";

function UserProfilePage() {
  const navigate = useNavigate();
  const userUID = getUID();
  const [userData, setUserData] = useState(null);
  const [imageUpload, setImageUpload] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
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
    if (userUID===null) return;
    const unsubscribe = fetchUserPosts(userUID, (postsData) => {
      setUserPosts(postsData);
    });

    return () => unsubscribe && unsubscribe();
  }, [userUID]);


  useEffect(() => {
    const fetchData = async () => {
      if (userUID) {
        const data = await getUserData(userUID);
        setUserData(data);
      }
    };
    fetchData();
  }, [userUID]);

  const handleLogOut = async () => {
    try {
      await logOutUser();
      navigate("/");
    } catch (error) {
      throw new Error("Error logging out");
    }
  };
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await createPost(
        formData,
        formData.serviceCategory,
        imageUpload,
        userUID
      );
    } catch (error) {
      throw new Error("Error submitting form");
    }
  };

  return (
    <div>
      <div className="welcomePlace">
        <h1>{userData?.UserName} </h1>
      </div>
      <button onClick={handleLogOut}>Sign Out</button>
      <form onSubmit={handleFormSubmit}>
        <input
          placeholder="Enter Title"
          name="serviceTitle"
          value={formData.serviceTitle}
          onChange={(event) => {
            {
              handleChange(event);
            }
          }}
        />
        <input
          placeholder="Example: hairstyling, plumbing"
          name="serviceCategory"
          value={formData.serviceCategory}
          onChange={(event) => {
            {
              handleChange(event);
            }
          }}
        />
        <input
          placeholder="Enter Description"
          name="serviceDescription"
          value={formData.serviceDescription}
          onChange={(event) => {
            {
              handleChange(event);
            }
          }}
        />
        <input
          placeholder="Enter Price range"
          name="servicePrice"
          value={formData.servicePrice}
          onChange={(event) => {
            {
              handleChange(event);
            }
          }}
        />
        <input
          type="file"
          name="ImageURL"
          onChange={(event) => {
            setImageUpload(event.target.files[0]);
          }}
        />
        <button type="submit">Create Post</button>
      </form>

      {userPosts.map((post, index)=>{
        return(
          <div key={index}>
          <p>{post.serviceCategory}</p>
          <img src={post.imageURL}/>
        </div>
        )
      })}
    </div>
  );
}

export default UserProfilePage;
