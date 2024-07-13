import { useState, useEffect } from "react";
import {
  fetchPendingAppointments,
  fetchUpcomingAppointments,
  acceptAppointment,
  declineAppointment,
} from "../BookingPage/BookingDB";
import "./AppointmentPage.css";
import AppointmentDetails from "./AppointmentDetails";
import Modal from "../Modal";

function AppointmentPage({ userData }) {
  const [isAppointmentDetailsModalShown, setIsAppointmentDetailsModalShown] =
    useState(false);
  const [pendingAppointmentData, setPendingAppointmentData] = useState([]);
  const [upcomingAppointmentData, setUpcomingAppointmentData] = useState([]);
  const userID = userData?.userID;

  const handleAcceptedAppointment = async (
    vendorID,
    customerID,
    appointmentID
  ) => {
    await acceptAppointment(customerID, vendorID, appointmentID);
    userAppointmentChanges(customerID);
    vendorAppointmentChanges(vendorID);
  };

  const handleDeclinedAppointment = async (
    vendorID,
    customerID,
    appointmentID
  ) => {
    await declineAppointment(customerID, vendorID, appointmentID);
    userAppointmentChanges(customerID);
    vendorAppointmentChanges(vendorID);
  };

  useEffect(() => {
    if (userID === undefined) {
      return;
    }
    const unsubscribePendingAppointment = fetchPendingAppointments(
      userID,
      (appointmentData) => {
        setPendingAppointmentData(appointmentData);
      }
    );
    const unsubscribeUpcomingAppointment = fetchUpcomingAppointments(
      userID,
      (appointmentData) => {
        setUpcomingAppointmentData(appointmentData);
      }
    );
    return () => {
      unsubscribePendingAppointment();
      unsubscribeUpcomingAppointment();
    };
  }, [userID]);

  const acceptedAppointment = async (userID, vendorID, appointmentID) => {
    await acceptAppointment(userID, vendorID, appointmentID);
  };

  const declinedAppointment = async (userID, vendorID, appointmentID) => {
    await declineAppointment(userID, vendorID, appointmentID);
  };

  const toggleModal = () => {
    setIsAppointmentDetailsModalShown(!isAppointmentDetailsModalShown);
  };

  if (
    pendingAppointmentData.length === 0 &&
    upcomingAppointmentData.length === 0
  ) {
    return (
      <div className="appointmentPage">
        <h2>No appointments found.</h2>
      </div>
    );
  }
  return (
    <div className="appointmentPage">
      <h2>Pending Appointments</h2>
      {pendingAppointmentData.map((appointment, index) => (
        <div key={index}>
          <p>{appointment.appointmentTitle}</p>
          {appointment.vendorUID === userID && (
            <div>
              <button
                onClick={() =>
                  handleAcceptedAppointment(
                    appointment.customerUID,
                    appointment.vendorUID,
                    appointment.docID
                  )
                }
              >
                Accept
              </button>
              <button
                onClick={() =>
                  handleDeclinedAppointment(
                    appointment.customerUID,
                    appointment.vendorUID,
                    appointment.docID
                  )
                }
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ))}

      <h2>Upcoming Appointments</h2>
      {upcomingAppointmentData.map((appointment, index) => (
        <div key={index}>
          <p>{appointment.appointmentTitle}</p>
          <div>
            <button>Add to Google Calendar</button>
            <button
              onClick={() =>
                handleDeclinedAppointment(
                  appointment.customerUID,
                  userID,
                  appointment.vendorUID,
                  appointment.docID
                )
              }
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AppointmentPage;
