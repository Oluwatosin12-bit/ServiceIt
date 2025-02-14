import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  addToRecommendedCategory,
  addToFavoriteDocs,
  isLiked,
  getRecommendedVendors,
  updateVendorPostLikes,
} from "./RecommendationDB";
import { handleDeletePost } from "../UseableFunctions";
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
  const [isNotificationSent, setIsNotificationSent] = useState(false);

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
  if (!isShown) {
    return null;
  }

  //add to favorites document, extract post category for recommendation
  const handleNotification = async (type) => {
    try {
      setFavorited(!favorited);
      addToRecommendedCategory(userUID, post.serviceCategories);
      await getRecommendedVendors(userUID, post.vendorUID);
      await addToFavoriteDocs(userUID, favorited, post);
      await updateVendorPostLikes(post, favorited);
      if (!isNotificationSent) {
        socket.emit("sendNotification", {
          userID: userUID,
          senderID: userUID,
          receiverID: post.vendorUID,
          senderName: userData?.UserName,
          receiverName: post.vendorUsername,
          postTitle: post.serviceTitle,
          type,
        });
      }
      setIsNotificationSent(true);
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
                <strong>Price Range:</strong> {post.servicePrice}
              </p>
              <p className="fullDisplayDescription">
                <strong>Description:</strong> {post.serviceDescription}
              </p>
              {post.vendorUID !== userUID && (
                <div>
                  <button
                    onClick={handleBookingFormOpen}
                    className="bookButton"
                  >
                    Book Now
                  </button>
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
                </div>
              )}
              {post.vendorUID === userUID && (
                <div>
                  <button
                    onClick={(event) =>
                      handleDeletePost(event, userUID, post.postID)
                    }
                    className="bookButton"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PostFullDisplay;
