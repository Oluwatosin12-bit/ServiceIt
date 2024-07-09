import { useNavigate } from "react-router-dom";
import "./PostFullDisplay.css";
function PostFullDisplay({ userUID, post, show, onClose }) {
  const navigate = useNavigate();
  const handleBookingFormOpen = () => {
    navigate("/BookingPage", { state: { post, userUID } });
  };
  if (!show) {
    return null;
  }
  const createdAt = post.createdAt.toDate();
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
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
                <i className="fa-regular fa-heart"></i>
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
