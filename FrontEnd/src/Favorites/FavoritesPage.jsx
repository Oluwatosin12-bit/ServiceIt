import { fetchUserFavorites } from "../BookingPage/BookingDB";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Notifications/NotificationPage.css";
import { useTheme } from "../UseContext";

function FavoritesPage({ userData }) {
  const userID = userData?.userID;
  const [userFavoritesData, setUserFavoritesData] = useState([]);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const handleOpenUserProfile = (post) => {
    navigate("/VendorProfile", { state: { post } });
  };

  useEffect(() => {
    if (userID === undefined) {
      return;
    }
    const unsubscribe = fetchUserFavorites(userID, (favoriteData) => {
      const userFavorites = favoriteData;
      setUserFavoritesData(userFavorites);
    });

    return () => unsubscribe();
  }, [userID]);

  if (userFavoritesData.length === 0) {
    return (
      <div className={`appointmentPage ${theme}`}>
        <div className="appointments">
          <h2>No Favorited Posts yet.</h2>
          <p className="emptyPageMessage">When you favorite posts, they will show up here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`notificationsSection ${theme}`}>
      <h2 className="notificationTitle">Favorite Posts:</h2>
      <div className="stackedNotifications">
        {userFavoritesData.map((favorite, index) => (
          <div key={index} className="notificationTab">
            <div className="notificationContent">
              <p  className="notificationMessage" onClick={() => handleOpenUserProfile(favorite.post)}>{favorite.post.vendorUsername}</p>
              <p  className="notificationTime">Post heading: {favorite.post.serviceTitle}</p>
            </div>
            <img src={favorite.post.imageURL} alt="Favorites Post Image" className="notificationImage"/>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FavoritesPage;
