import { useState, useEffect } from "react";
import {
  fetchPendingAppointments,
  fetchUpcomingAppointments,
  userAppointmentChanges,
  vendorAppointmentChanges,
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

  const acceptedAppointment = async (vendorID, customerID, appointmentID) => {
    console.log("vendor:", vendorID)
    console.log("Customer:", customerID)
    await acceptAppointment(customerID, vendorID, appointmentID);
    userAppointmentChanges(customerID);
    vendorAppointmentChanges(vendorID)
  };

  const declinedAppointment = async (vendorID, customerID, appointmentID) => {
    console.log("vendor:", vendorID)
    console.log("Customer:", customerID)
    await declineAppointment(customerID, vendorID, appointmentID);
    userAppointmentChanges(customerID);
    vendorAppointmentChanges(vendorID)
  };

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
  console.log(pendingAppointmentData)
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
                  declinedAppointment(
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
                declinedAppointment(
                  appointment.customerUID,
                  userID,
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
