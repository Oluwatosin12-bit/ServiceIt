import { fetchNotifications } from "../BookingPage/BookingDB";
import { useState, useEffect } from "react";
import "./NotificationPage.css";
import { useTheme } from "../UseContext";

function NotificationsPage({ userData }) {
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
    });

    return () => unsubscribe();
  }, [userID]);
  if (userNotificationData.length === 0) {
    return (
      <div className={`appointmentPage ${theme}`}>
        <div className="appointments">
          <i className="fa-solid fa-bell"></i>
          <h2>No Notifications yet.</h2>
          <p>When you get notifications, they will show up here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`notificationsSection ${theme}`}>
      <h2 className="notificationTitle">User Notifications:</h2>
      <div className="stackedNotifications">
        {userNotificationData.map((notification) => (
          <div key={notification.id} className="notificationTab">
            <p>{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;
