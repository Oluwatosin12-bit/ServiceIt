function NotificationsPreview({ notificationData }) {
  return (
    <div>
      <h3>{notificationData.customerUsername}</h3>
      <p>{notificationData.appointmentTitle}</p>
    </div>
  );
}

export default NotificationsPreview;
