import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  feedCategory,
  addToFavoriteDocs,
  postsFromFavorites,
  isLiked,
} from "./RecommendationDB";
import "./PostFullDisplay.css";

function PostFullDisplay({
  userUID,
  post,
  isShown,
  onClose,
  userData,
  socket,
}) {
  const [favorited, setFavorited] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    const postID = post?.postID;
    const unsubscribe = isLiked(userUID, postID, (liked) => {
      setFavorited(liked);
    });
    return () => unsubscribe();
  }, [post.postID]);

  const navigate = useNavigate();
  const handleBookingFormOpen = () => {
    navigate("/BookingPage", { state: { post, userUID } });
  };
  if (isShown === false) {
    return null;
  }
  const createdAt = post.createdAt.toDate();

  //add to favorites document, extract post category for recommendation
  const handleNotification = async (type) => {
    try {
      setFavorited(!favorited);
      feedCategory(userUID, post.serviceCategories);
      await addToFavoriteDocs(userUID, favorited, post);
      if (notificationSent === false) {
        socket.emit("sendNotification", {
          userID: userUID,
          senderID: userUID,
          receiverID: post.userId,
          senderName: userData?.UserName,
          receiverName: post.vendorUsername,
          postTitle: post.serviceTitle,
          type,
        });
      }
      setNotificationSent(true);
    } catch (error) {
      throw new Error(`Error updating likes: ${error.message}`);
    }
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div
        className="modalContent"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modalClose" onClick={onClose}>
          &times;
        </button>
        <div className="modalBody">
          <div className="fullDisplay">
            <div className="imageArea">
              <h3>{post.vendorUsername}</h3>
              <img src={post.imageURL} className="fullDisplayImage" />
            </div>
            <div className="fullDisplayDetails">
              <h3 className="fullDisplayTitle">{post.serviceTitle}</h3>
              <p className="fullDisplayPrice">
                Price Range: {post.servicePrice}
              </p>
              <p className="fullDisplayDescription">
                Description: {post.serviceDescription}
              </p>
              <button onClick={handleBookingFormOpen}>Book Now</button>
              <span>
                {favorited ? (
                  <i
                    className="fa-solid fa-heart hearted"
                    onClick={() => handleNotification(1)}
                  />
                ) : (
                  <i
                    className="fa-regular fa-heart"
                    onClick={() => handleNotification(1)}
                  />
                )}
              </span>
              <p className="fullDisplayTimestamp">
                Created at: {createdAt.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PostFullDisplay;
