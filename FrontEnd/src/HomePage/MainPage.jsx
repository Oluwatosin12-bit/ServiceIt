import { useEffect, useState } from "react";
import { fetchUserFeed } from "../UserAuthentication/FirestoreDB";
import CategoryList from "./CategoryList";
import PostsPreview from "./PostsPreview";
import PostFullDisplay from "../PostFullDisplay";
import "./MainPage.css";

function MainPage({ userUID, userData }) {
  const [userFeed, setUserFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalShown, setIsModalShown] = useState(false);
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
    setIsModalShown(!isModalShown);
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
        {isModalShown && selectedPost && (
          <div>
            <PostFullDisplay
              userUID={userUID}
              post={selectedPost}
              show={isModalShown}
              onClose={toggleModal}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MainPage;
