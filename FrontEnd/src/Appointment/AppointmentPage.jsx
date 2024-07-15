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
import { useTheme } from "../UseContext";
import AppointmentDetails from "./AppointmentDetails";
import Modal from "../Modal";

function AppointmentPage({ userData }) {
  const [isAppointmentDetailsModalShown, setIsAppointmentDetailsModalShown] =
    useState(false);
  const [pendingAppointmentData, setPendingAppointmentData] = useState([]);
  const [upcomingAppointmentData, setUpcomingAppointmentData] = useState([]);
  const userID = userData?.userID;
  const { theme} = useTheme();

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

  const toggleModal = () => {
    setIsAppointmentDetailsModalShown(!isAppointmentDetailsModalShown);
  };

  if (
    pendingAppointmentData.length === 0 &&
    upcomingAppointmentData.length === 0
  ) {
    return (
      <div className={`appointmentPage ${theme}`}>
        <div className="appointments">
          <h2>No appointments found.</h2>
        </div>
      </div>
    );
  }
  return (
    <div className={`appointmentPage ${theme}`}>
      <div className="appointments">
        <h2>Pending Appointments</h2>
        {pendingAppointmentData.map((appointment, index) => (
          <div key={index} className="appointmentTab">
            <div className="appointmentInfo">
              {appointment.vendorUID === userID && (
                <p className="appointmentUser">{appointment.customerUsername}</p>
              )}
              {appointment.customerUID === userID && (
                <p className="appointmentUser">{appointment.vendorUsername}</p>
              )}
              <p className="appointmentTitle">{appointment.appointmentTitle}</p>
              <div className="appointmentDetail">
                <i className="fa-solid fa-calendar"></i>
                <p>{appointment.appointmentDate}</p>
              </div>
              <div className="appointmentDetail">
                <i className="fa-solid fa-clock"></i>
                <p>{appointment.appointmentTime}</p>
              </div>
            </div>
            {appointment.vendorUID === userID && (
              <div className="appointmentActions">
                <button
                 className="appointmentButtons"
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
                 className="appointmentButtons"
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
          <div key={index} className="appointmentTab">
            <div className="appointmentInfo">
              <p className="appointmentUser">{appointment.vendorUsername}</p>
              <p className="appointmentTitle">{appointment.appointmentTitle}</p>
              <div className="appointmentDetail">
                <i className="fa-solid fa-calendar"></i>
                <p>{appointment.appointmentDate}</p>
              </div>
              <div className="appointmentDetail">
                <i className="fa-solid fa-clock"></i>
                <p>{appointment.appointmentTime}</p>
              </div>
            </div>
            <div className="appointmentActions">
              <button className="appointmentButtons">Add to Google Calendar</button>
              <button
               className="appointmentButtons"
                onClick={() =>
                  handleDeclinedAppointment(
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
    </div>
  );
}

export default AppointmentPage;
