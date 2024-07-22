import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  fetchUserPosts,
} from "../UserAuthentication/FirestoreDB";
import Modal from "../Modal";
import { useTheme } from "../UseContext";
import "./UserProfile.css";

function VendorProfilePage() {
  const { theme } = useTheme();
  const location = useLocation();
  const { post } = location.state || {};
  const vendorID = post.vendorUID
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (vendorID === null) return;
    const unsubscribe = fetchUserPosts(vendorID, (postsData) => {
      setUserPosts(postsData);
    });
    return () => unsubscribe && unsubscribe();
  }, [vendorID]);

  return (
    <div className={`userProfileSection ${theme}`}>
      <div className="userInfo">
        <div className="welcomePlace">
          <div>
            <img src="/Profile.jpeg" alt="profile avatar" />
            <h1>{post?.VendorUsername} </h1>
            <div className="bioContainer">
              <p>Bio:</p>
            </div>
            <p>I am an amazing service provider</p>
          </div>
        </div>

      </div>
      <div className="userPosts">
        <div className="userPostsPreview">
          {userPosts.map((post, index) => (
            <div key={index} className="eachPost">
              <div className="postHeading">
                <p>{post.serviceTitle}</p>
              </div>
              <img src={post.imageURL} alt="post photo" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VendorProfilePage;
