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
  const [isAppointmentDetailsModalShown, setIsAppointmentDetailsModalShown] = useState(false);
  const [pendingAppointmentData, setPendingAppointmentData] = useState([]);
  const [upcomingAppointmentData, setUpcomingAppointmentData] = useState([]);
  const userID = userData?.userID;

  useEffect(() => {
    if (userID === undefined) {
      return;
    }
    const unsubscribe = fetchPendingAppointments(userID, (appointmentData) => {
      setPendingAppointmentData(appointmentData);
    });

    return () => unsubscribe();
  }, [userID]);

  useEffect(() => {
    if (userID === undefined) {
      return;
    }
    const unsubscribe = fetchUpcomingAppointments(userID, (appointmentData) => {
      setUpcomingAppointmentData(appointmentData);
    });

    return () => unsubscribe();
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

  if (pendingAppointmentData === null && upcomingAppointmentData == null) {
    return (
      <div>
        <h2>No Appointment Data found.</h2>
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
                  acceptedAppointment(
                    userID,
                    appointment.vendorUID,
                    appointment.docID
                  )
                }
              >
                Accept
              </button>
              <button
                onClick={() =>
                  declinedAppointment(
                    userID,
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
                declinedAppointment(
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
