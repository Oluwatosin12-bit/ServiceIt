import { useState, useEffect } from "react";
import {
  fetchPendingAppointments,
  fetchUpcomingAppointments,
  acceptAppointment,
  declineAppointment,
} from "../BookingPage/BookingDB";
import {  updateVendorPostAppointment} from "../HomePage/RecommendationDB"
import "./AppointmentPage.css";
import { useTheme } from "../UseContext";
import AppointmentDetails from "./AppointmentDetails";

function AppointmentPage({ userData, socket }) {
  const [isAppointmentDetailsModalShown, setIsAppointmentDetailsModalShown] =
    useState(false);
  const [pendingAppointmentData, setPendingAppointmentData] = useState([]);
  const [upcomingAppointmentData, setUpcomingAppointmentData] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const userID = userData?.userID;
  const ACCEPTED_ACTION_TYPE = 3
  const DECLINED_ACTION_TYPE = 4
  const { theme } = useTheme();

  const handleAcceptedAppointment = async (
    appointment,
    vendorID,
    customerID,
    appointmentID,
    type
  ) => {
    await acceptAppointment(customerID, vendorID, appointmentID);
    await acceptAppointment(post)
    await socket.emit("sendNotification", {
      userID: userData?.userID,
      senderID: userData?.userID,
      receiverID: appointment.customerUID,
      senderName: userData?.UserName,
      receiverName: appointment.customerUsername,
      appointmentDate: appointment.appointmentDate,
      appointmentTitle: appointment.appointmentTitle,
      type,
    });
  };

  const handleDeclinedAppointment = async (
    appointment,
    vendorID,
    customerID,
    appointmentID,
    type
  ) => {
    const logOutConfirmation = window.confirm(
      "Are you sure you want to decline appointment?"
    );
    if (logOutConfirmation === true) {
    await declineAppointment(customerID, vendorID, appointmentID);
    await socket.emit("sendNotification", {
      userID: userData?.userID,
      senderID: userData?.userID,
      receiverID: appointment.customerUID,
      senderName: userData?.UserName,
      receiverName: appointment.customerUsername,
      appointmentDate: appointment.appointmentDate,
      appointmentTitle: appointment.appointmentTitle,
      type,
    });
  }
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

  const toggleAppointmentDetailsModal = (appointment) => {
    setSelectedAppointment(appointment)
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
        {pendingAppointmentData.map((appointment) => (
          <div key={appointment.docID} className="appointmentTab" onClick={()=>toggleAppointmentDetailsModal(appointment)}>
            <div className="appointmentInfo">
              {appointment.vendorUID === userID && (
                <p className="appointmentUser">
                  {appointment.customerUsername}
                </p>
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
                  className="appointmentButtons acceptAppointment"
                  onClick={() =>
                    handleAcceptedAppointment(
                      appointment,
                      appointment.customerUID,
                      appointment.vendorUID,
                      appointment.docID,
                      ACCEPTED_ACTION_TYPE
                    )
                  }
                >
                  Accept
                </button>
                <button
                  className="appointmentButtons cancelAppointment"
                  onClick={() =>
                    handleDeclinedAppointment(
                      appointment,
                      appointment.customerUID,
                      appointment.vendorUID,
                      appointment.docID,
                      DECLINED_ACTION_TYPE
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
        {upcomingAppointmentData.map((appointment) => (
          <div key={appointment.docID} className="appointmentTab" onClick={()=>toggleAppointmentDetailsModal(appointment)}>
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
              <button className="appointmentButtons acceptAppointment">
                Add to Google Calendar
              </button>
              <button
                className="appointmentButtons cancelAppointment"
                onClick={() =>
                  handleDeclinedAppointment(
                    appointment,
                    appointment.customerUID,
                    appointment.vendorUID,
                    appointment.docID,
                    DECLINED_ACTION_TYPE
                  )
                }
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        ))}
        {isAppointmentDetailsModalShown && selectedAppointment !== null &&(
          <div>
            <AppointmentDetails
            isShown={isAppointmentDetailsModalShown}
            onClose={toggleAppointmentDetailsModal}
            appointment={selectedAppointment}/>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentPage;
