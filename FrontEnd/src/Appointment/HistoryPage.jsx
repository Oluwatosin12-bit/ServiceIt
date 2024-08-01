import { useState, useEffect } from "react";
import { useTheme } from "../UseContext";
import { fetchPastAppointments } from "../BookingPage/BookingDB";
import AppointmentDetails from "./AppointmentDetails";
import LoadingPage from "../LoadingComponent/LoadingPage";

function HistoryPage({ userData }) {
  const userID = userData?.userID;
  const [pastAppointmentData, setPastAppointmentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAppointmentDetailsModalShown, setIsAppointmentDetailsModalShown] =
  useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (userID === undefined) {
      return;
    }
    const unsubscribePastAppointments = fetchPastAppointments(
      userID,
      (appointmentData) => {
        setPastAppointmentData(appointmentData);
      }
    );
    setIsLoading(false);
    return () => {
      unsubscribePastAppointments();
    };
  }, [userID]);

  const toggleAppointmentDetailsModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailsModalShown(!isAppointmentDetailsModalShown);
  };

  if (pastAppointmentData.length === 0) {
    return (
      <div className={`appointmentPage ${theme}`}>
        <div className="appointments">
          <h2>No past appointments.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`appointmentPage ${theme}`}>
      <h2>Past Appointments</h2>
      {isLoading ? (
        <LoadingPage />
      ) : (
        pastAppointmentData.map((appointment) => (
          <div className="appointmentTab" key={appointment.docID} onClick={()=>toggleAppointmentDetailsModal(appointment)}>
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
        ))
      )}
      {isAppointmentDetailsModalShown && selectedAppointment !== null && (
          <div>
            <AppointmentDetails
              isShown={isAppointmentDetailsModalShown}
              onClose={toggleAppointmentDetailsModal}
              appointment={selectedAppointment}
            />
          </div>
        )}
    </div>
  );
}

export default HistoryPage;
