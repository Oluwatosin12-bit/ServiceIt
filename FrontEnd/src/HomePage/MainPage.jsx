import { useEffect, useState } from "react";
import { fetchUserFeed } from "../UserAuthentication/FirestoreDB";
import CategoryList from "./CategoryList";
import "./MainPage.css";

function MainPage({ userUID }) {
  const [userFeed, setUserFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
            <div key={index}>
              <p>{post.serviceCategory}</p>
              <img src={post.imageURL} alt={`Post ${index}`} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MainPage;
