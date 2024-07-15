import NotificationsPreview from "./NotificationPreview";
import { fetchNotifications } from "../BookingPage/BookingDB";
import { useState, useEffect } from "react";
import "./NotificationPage.css";
import { useTheme } from "../UseContext";

function NotificationsPage({ userData, vendorID, notifications }) {
  const userID = userData?.userID;
  const [userNotificationData, setUserNotificationData] = useState([]);
  const [allNotifications, setAllNotifications] = useState([])
  const { theme} = useTheme();

  // useEffect(()=>{
  //   setAllNotiifcations[...allNotifications, notifications]
  // }, [notiifications])
  console.log(notifications)

  useEffect(() => {
    if (userID === undefined){
      return;
    }
    const unsubscribe = fetchNotifications(userID, (notificationData) => {
      const userNotifications = notificationData
      setUserNotificationData(userNotifications);
    });

    return () => unsubscribe();
  }, [userID]);
  if (userNotificationData.length === 0) {
    return (
      <div className={`appointmentPage ${theme}`}>
        <div className="appointments">
        <i class="fa-solid fa-bell"></i>
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
      {/* {userNotificationData.map((appointment, index) => (
        <div key={index} className="notificationTab">
          <p>{appointment.message}</p>
          <NotificationsPreview notificationData={userNotificationData} />
        </div>
      ))} */}
      </div>
    </div>
  );
}

export default NotificationsPage;
