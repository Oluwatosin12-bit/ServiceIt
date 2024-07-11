import NotificationsPreview from "./NotificationPreview";
import {
  userAppointmentNotification,
  vendorAppointmentNotification,
} from "../BookingPage/BookingDB";
import { useState, useEffect } from "react";
import "./NotificationPage.css";

function NotificationsPage({ userData, vendorId }) {
  const userId = userData?.userID;
  const [userAppointmentRequestData, setUserAppointmentRequestData] = useState(
    []
  );
  const [vendorAppointmentRequestData, setVendorAppointmentRequestData] =
    useState([]);

  useEffect(() => {
    if (userId === undefined) return;
    const unsubscribe = userAppointmentNotification(
      userId,
      (userAppointmentData) => {
        setUserAppointmentRequestData(userAppointmentData);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (vendorId === undefined) return;
    const unsubscribe = vendorAppointmentNotification(
      vendorId,
      (userAppointmentData) => {
        setVendorAppointmentRequestData(userAppointmentData);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  return (
    <div className="notificationsSection">
      <p>Hi</p>
      <h2>User Notifications:</h2>
      {userAppointmentRequestData.map((appointment, index) => (
        <div key={index}>
          <p>{appointment.appointmentTitle}</p>
          <NotificationsPreview
            appointmentRequestData={userAppointmentRequestData}
          />
        </div>
      ))}

      {vendorAppointmentRequestData.map((appointment, index) => (
        <div key={index}>
          <p>{appointment.appointmentTitle}</p>
          <NotificationsPreview
            appointmentRequestData={userAppointmentRequestData}
          />
        </div>
      ))}
    </div>
  );
}

export default NotificationsPage;
