function AppointmentDetails({ userData, appointmentData }) {
  return (
    <div>
      <h3>{appointmentData.appointmentTitle}</h3>
      <p>Appointment made by {appointmentData.appointmentTitle}</p>
    </div>
  );
}

export default AppointmentDetails;
