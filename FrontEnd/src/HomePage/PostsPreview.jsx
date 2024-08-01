import { useNavigate } from "react-router-dom";
import "./PostsPreview.css";
function PostsPreview({ post }) {
  const navigate = useNavigate();
  const handleOpenUserProfile = () => {
    navigate("/VendorProfile", { state: { post } });
  };
  function truncateDescription(description, wordLimit) {
    const words = description.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return description;
  }

  return (
    <div className="feedPreview">
      <div className="postHeader">
        <h3 onClick={handleOpenUserProfile} className="vendorUsername">
          {post.vendorUsername}
        </h3>
        <span className="moreOptions">
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </span>
      </div>
      <img src={post.imageURL} className="feedImage" />
      <h3 className="feedTitle">{post.serviceTitle}</h3>
      <p className="feedPrice">
        <strong>Price Range:</strong> {post.servicePrice}
      </p>
      <p className="feedDescription">
        <strong>Description:</strong>
        {truncateDescription(post.serviceDescription, 20)}
      </p>
      <p className="feedTimestamp">
        Created at: {post.createdAt.toLocaleString()}
      </p>
    </div>
  );
}
export default PostsPreview;
