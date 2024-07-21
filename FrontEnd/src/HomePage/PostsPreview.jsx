import "./PostsPreview.css";
function PostsPreview({ post }) {
  const createdAt = post.createdAt.toDate();
  
  return (
    <div className="feedPreview">
      <div className="postHeader">
        <h3>{post.vendorUsername}</h3>
        <span className="moreOptions">
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </span>
      </div>
      <img src={post.imageURL} className="feedImage" />
      <h3 className="feedTitle">{post.serviceTitle}</h3>
      <p className="feedPrice">Price Range: {post.servicePrice}</p>
      <p className="feedDescription">Description: {post.serviceDescription}</p>
      <p className="feedTimestamp">Created at: {createdAt.toLocaleString()}</p>
    </div>
  );
}
export default PostsPreview;
