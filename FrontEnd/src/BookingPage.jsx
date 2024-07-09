import "./BookingPage.css";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { requestAppointment } from "./UserAuthentication/FirestoreDB";

function BookingForm() {
  const location = useLocation();
  const { post, userUID } = location.state || {};
  const [appointmentData, setAppointmentData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    additionalNote: "",
  });
  const handleChange = (event) => {
    const { name, value } = event.target;
    setAppointmentData({ ...appointmentData, [name]: value });
  };

  const sendAppointmentRequest = async (
    userUID,
    vendorUID,
    appointmentData
  ) => {
    await requestAppointment(userUID, vendorUID, appointmentData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    sendAppointmentRequest(userUID, post.userId, appointmentData);
  };

  if (!post) {
    return (
      <div>
        <h2>Booking Page</h2>
        <p>No post data available.</p>
      </div>
    );
  }
  return (
    <div className="bookingPage">
      <form className="bookingForm" onSubmit={handleSubmit}>
        <h2 className="vendorUsername">
          Book an appointment with {post.vendorUsername}
        </h2>
        <div>
          <label htmlFor="title">Appointment Title</label>
          <textarea
            name="title"
            id="title"
            value={appointmentData.title}
            onChange={(event) => handleChange(event)}
          />
        </div>
        <div>
          <label htmlFor="description">Job Description</label>
          <textarea
            name="description"
            id="description"
            value={appointmentData.description}
            onChange={(event) => handleChange(event)}
          />
        </div>
        <input
          type="date"
          name="date"
          id="date"
          value={appointmentData.date}
          onChange={(event) => handleChange(event)}
        ></input>
        <input
          type="time"
          name="time"
          id="time"
          value={appointmentData.time}
          onChange={(event) => handleChange(event)}
        ></input>
        <label>Additional notes (optional)</label>
        <textarea
          name="additionalNote"
          id="additionalNote"
          value={appointmentData.additionalNote}
          onChange={(event) => handleChange(event)}
        />
        <button type="submit">Send Request</button>
      </form>
    </div>
  );
}

export default BookingForm;
