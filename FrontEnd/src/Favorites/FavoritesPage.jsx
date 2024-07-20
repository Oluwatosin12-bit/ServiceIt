import { fetchUserFavorites } from "../BookingPage/BookingDB";
import { useState, useEffect } from "react";
import "../Notifications/NotificationPage.css";
import { useTheme } from "../UseContext";

function FavoritesPage({ userData }) {
  const userID = userData?.userID;
  const [userFavoritesData, setUserFavoritesData] = useState([]);
  const { theme } = useTheme();

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
          <p>When you favorite posts, they will show up here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`notificationsSection ${theme}`}>
      <h2 className="notificationTitle">User Notifications:</h2>
      <div className="stackedNotifications">
        {userFavoritesData.map((favorite, index) => (
          <div key={index} className="notificationTab">
            <p>{favorite.post.vendorUsername}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FavoritesPage;
