import { fetchNotifications } from "../BookingPage/BookingDB";
import { useState, useEffect } from "react";
import "./NotificationPage.css";
import { useTheme } from "../UseContext";
import LoadingPage from "../LoadingComponent/LoadingPage"

function NotificationsPage({ userData }) {
  const [isLoading, setIsLoading] = useState(true);
  const userID = userData?.userID;
  const [userNotificationData, setUserNotificationData] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    if (userID === undefined) {
      return;
    }
    const unsubscribe = fetchNotifications(userID, (notificationData) => {
      const userNotifications = notificationData;
      setUserNotificationData(userNotifications);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userID]);
  if (userNotificationData.length === 0) {
    return (
      <div className={`appointmentPage ${theme}`}>
        <div className="appointments">
          <h2>No Notifications yet.</h2>
          <p className="emptyPageMessage">
            When you get notifications, they will show up here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`notificationsSection ${theme}`}>
      <h2 className="notificationTitle">User Notifications:</h2>
      <div className="stackedNotifications">
        {isLoading ? (<LoadingPage />) : userNotificationData.map((notification, index) => (
          <div key={index} className="notificationTab">
            <div className="notificationContent">
              <p className="notificationMessage">{notification.message}</p>
              <p className="notificationTime">{notification.timeStamp}</p>
            </div>
            {notification.image && (
              <img
                src={notification.image}
                alt="Notification Image"
                className="notificationImage"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;
