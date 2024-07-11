import { useEffect, useState } from "react";
import { fetchUserFeed } from "../UserAuthentication/FirestoreDB";
import CategoryList from "./CategoryList";
import PostsPreview from "./PostsPreview";
import PostFullDisplay from "../PostFullDisplay";
import "./MainPage.css";

function MainPage({ userUID, userData }) {
  const [userFeed, setUserFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostDetailModalShown, setIsPostDetailModalShown] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchFeed = async () => {
    if (userUID !== null) {
      const feedData = await fetchUserFeed(userUID);
      setUserFeed(feedData);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchFeed();
  }, [userUID]);

  const toggleModal = (post) => {
    setSelectedPost(post);
    setIsPostDetailModalShown(!isPostDetailModalShown);
  };

  return (
    <div className="homePageList">
      <div className="categorySection">
        <CategoryList />
      </div>
      <div className="feedSection">
        {isLoading ? (
          <p>Loading...</p>
        ) : userFeed.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          userFeed.map((post, index) => (
            <div
              key={index}
              className="postFeed"
              onClick={() => toggleModal(post)}
            >
              <PostsPreview post={post} />
            </div>
          ))
        )}
        {isPostDetailModalShown && selectedPost !== null && (
          <div>
            <PostFullDisplay
              userUID={userUID}
              post={selectedPost}
              isShown={isPostDetailModalShown}
              onClose={toggleModal}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MainPage;
