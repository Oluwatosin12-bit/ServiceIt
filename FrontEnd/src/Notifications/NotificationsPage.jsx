import NotificationsPreview from "./NotificationPreview";
import { fetchNotifications } from "../BookingPage/BookingDB";
import { useState, useEffect } from "react";
import "./NotificationPage.css";

function NotificationsPage({ userData, vendorID }) {
  const userID = userData?.userID;
  const [userNotificationData, setUserNotificationData] = useState([]);
  const [vendorNotificationData, setVendorNotificationData] = useState([]);

  useEffect(() => {
    if (userID === undefined) return;
    const unsubscribe = fetchNotifications(userID, (userAppointmentData) => {
      setUserNotificationData(userAppointmentData);
    });

    return () => unsubscribe();
  }, [userID]);

  useEffect(() => {
    if (vendorID === undefined) return;
    const unsubscribe = fetchNotifications(vendorID, (userAppointmentData) => {
      setVendorNotificationData(userAppointmentData);
    });

    return () => unsubscribe();
  }, [vendorID]);
  return (
    <div className="notificationsSection">
      <h2>User Notifications:</h2>
      {userNotificationData.map((appointment, index) => (
        <div key={index}>
          <p>{appointment.message}</p>
          <NotificationsPreview notificationData={userNotificationData} />
        </div>
      ))}

      {vendorNotificationData.map((appointment, index) => (
        <div key={index}>
          <p>{appointment.message}</p>
          <NotificationsPreview notificationData={vendorNotificationData} />
        </div>
      ))}
    </div>
  );
}

export default NotificationsPage;
