function NotificationsPreview({ appointmentRequestData }) {
  return (
    <div>
      <h3>{appointmentRequestData.customerUsername}</h3>
      <p>{appointmentRequestData.title}</p>
    </div>
  );
}

export default NotificationsPreview;
