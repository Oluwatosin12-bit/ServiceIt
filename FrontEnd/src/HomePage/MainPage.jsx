import { useEffect, useState } from "react";
import { fetchUserFeed } from "./RecommendationDB";
import CategoryList from "./CategoryList";
import PostsPreview from "./PostsPreview";
import PostFullDisplay from "./PostFullDisplay";
import SearchBar from "../Search/SearchBar";
import { useTheme } from "../UseContext";
import "./MainPage.css";

function MainPage({ userUID, userData, socket }) {
  const [userFeed, setUserFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostDetailModalShown, setIsPostDetailModalShown] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const { theme } = useTheme();

  const fetchFeed = async () => {
    if (userUID !== null) {
      const feedData = await fetchUserFeed(userUID);
      setUserFeed(feedData);
      setFilteredPosts(feedData);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchFeed();
  }, [userUID]);

  const filterPosts = (selectedCategories = [], searchWord = "") => {
    let filtered = [...userFeed]
    if (selectedCategories.length > 0){
      filtered = filtered.filter((post) =>
      selectedCategories.some((category) =>
        post.serviceCategories.includes(category)
      )
    );
    }

    if (searchWord === "") {
      setFilteredPosts(filtered);
      return;
    } else if (searchWord !== "") {
      const lowerCaseSearch = searchWord.toLowerCase();
      filtered = filtered.filter((post) => {
        const categoryMatch = post.serviceCategories.some((category) =>
          category.toLowerCase().includes(lowerCaseSearch)
        );
        const usernameMatch = post.vendorUsername
          .toLowerCase()
          .includes(lowerCaseSearch);
        const locationMatch = post.serviceLocations
          .toLowerCase()
          .includes(lowerCaseSearch);

        return categoryMatch || usernameMatch || locationMatch;
      });
    }
    setFilteredPosts(filtered);
  };

  const toggleModal = (post) => {
    setSelectedPost(post);
    setIsPostDetailModalShown(!isPostDetailModalShown);
  };

  return (
    <div className={`homePageList ${theme}`}>
      <div className="categorySection">
        <CategoryList filterPosts={filterPosts} />
      </div>
      <div className="bodyArea">
        <div className="searchArea">
          <SearchBar filterPosts={filterPosts} />
        </div>
        <div className="feedSection">
          {isLoading ? (
            <p>Loading...</p>
          ) : filteredPosts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            filteredPosts.map((post, index) => (
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
                userData={userData}
                socket={socket}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainPage;
