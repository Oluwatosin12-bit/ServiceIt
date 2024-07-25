import "../HomePage/PostFullDisplay.css";

function AppointmentDetails({ isShown, onClose, appointment }) {
  if (!isShown) {
    return null;
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div
        className="modalContent"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modalClose" onClick={onClose}>
          &times;
        </button>
        <div className="modalBody">
          <div className="fullDisplay">
            <div className="imageArea">
              <h3>{appointment.vendorUsername}</h3>
              <img src={appointment.imageURL} className="fullDisplayImage" />
            </div>
            <div className="fullDisplayDetails">
              <h3>{appointment.appointmentTitle}</h3>
              <p>Appointment made by {appointment.customerUsername}</p>
              <div>
                <p>
                  <strong>Customer Details:</strong>
                </p>
                <p>Customer Name: {appointment.customerName}</p>
                <p>Customer Email: {appointment.customerEmail}</p>
              </div>
              <div>
                <p>
                  <strong>Vendor Details:</strong>
                  <p>Vendor Name: {appointment.vendorName}</p>
                  <p>Vendor Email: {appointment.vendorEmail}</p>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetails;
