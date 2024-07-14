import NotificationsPreview from "./NotificationPreview";
import { fetchNotifications } from "../BookingPage/BookingDB";
import { useState, useEffect } from "react";
import "./NotificationPage.css";

function NotificationsPage({ userData, vendorID, notifications }) {
  const userID = userData?.userID;
  const [userNotificationData, setUserNotificationData] = useState([]);
  const [allNotifications, setAllNotifications] = useState([])

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

  return (
    <div className="notificationsSection">
      <h2>User Notifications:</h2>
      {/* {userNotificationData.map((appointment, index) => (
        <div key={index}>
          <p>{appointment.message}</p>
          <NotificationsPreview notificationData={userNotificationData} />
        </div>
      ))} */}
    </div>
  );
}

export default NotificationsPage;
