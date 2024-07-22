import "./BookingPage.css";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { requestAppointment } from "./BookingDB";
import { feedCategory, recommendedVendors } from "../HomePage/RecommendationDB";
import Modal from "../Modal";
import NotificationsPage from "../Notifications/NotificationsPage";

function BookingForm({ userData, socket }) {
  const location = useLocation();
  const { post, userUID } = location.state || {};
  const [isBookingFormModalShown, setIsBookingFormModalShown] = useState(false);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [modalPopUpMessage, setModalPopUpMessage] = useState("");
  const [appointmentData, setAppointmentData] = useState({
    appointmentTitle: "",
    appointmentDescription: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentAdditionalNote: "",
    vendorUsername: post.vendorUsername,
  });
  const handleChange = (event) => {
    const { name, value } = event.target;
    setAppointmentData({ ...appointmentData, [name]: value });
  };

  const sendAppointmentRequest = async (
    userUID,
    vendorUID,
    vendorUsername,
    appointmentData,
    userData
  ) => {
    await requestAppointment(
      userUID,
      vendorUID,
      vendorUsername,
      appointmentData,
      userData
    );
  };

  useEffect(() => {
    const isFormValid = Object.values(appointmentData).every(
      (value) => value !== ""
    );
    setIsFormValid(isFormValid);
    if (userUID === post.userId) {
      setIsFormValid(false);
    }
  }, [appointmentData]);

  const handleSubmit = async (event, type) => {
    try {
      event.preventDefault();
      if (userUID === post.userId) {
        setModalPopUpMessage("You cannot book an appointment with yourself");
      } else {
        setIsRequestPending(true);
        await sendAppointmentRequest(
          userUID,
          post.userId,
          post.vendorUsername,
          appointmentData,
          userData,
          post.VendorEmail,
        );
        await feedCategory(userUID, post.serviceCategories);
        await recommendedVendors(userUID, post.vendorUID)
        await socket.emit("sendNotification", {
          userID: userUID,
          senderID: userUID,
          receiverID: post.userId,
          senderName: userData?.UserName,
          receiverName: post?.vendorUsername,
          appointmentDate: appointmentData.appointmentDate,
          appointmentTitle: appointmentData.appointmentTitle,
          type,
        });
        setAppointmentData({
          appointmentTitle: "",
          appointmentDescription: "",
          appointmentDate: "",
          appointmentTime: "",
          appointmentAdditionalNote: "",
        });
        setModalPopUpMessage(
          `Your appointment request has been sent to ${post.vendorUsername}`
        );
      }
      toggleModal();
    } catch (error) {
      throw new Error(`Error sending appointment request ${error.message}`);
    } finally {
      setIsRequestPending(false);
    }
  };

  const toggleModal = () => {
    if (isRequestPending !== null && !isRequestPending) {
      setIsBookingFormModalShown(!isBookingFormModalShown);
    }
  };

  if (post === null) {
    return (
      <div>
        <h2>Booking Page</h2>
        <p>No post data available.</p>
      </div>
    );
  }
  return (
    <div className="bookingPage">
      <form className="bookingForm" onSubmit={() => handleSubmit(event, 2)}>
        <h2 className="vendorUsername">
          Book an appointment with {post.vendorUsername}
        </h2>
        <div>
          <label htmlFor="appointmentTitle">Appointment Title</label>
          <textarea
            name="appointmentTitle"
            id="appointmentTitle"
            value={appointmentData.appointmentTitle}
            onChange={(event) => handleChange(event)}
          />
        </div>
        <div>
          <label htmlFor="appointmentDescription">Job Description</label>
          <textarea
            name="appointmentDescription"
            id="appointmentDescription"
            value={appointmentData.appointmentDescription}
            onChange={(event) => handleChange(event)}
          />
        </div>
        <input
          type="date"
          name="appointmentDate"
          id="appointmentDate"
          value={appointmentData.appointmentDate}
          onChange={(event) => handleChange(event)}
        ></input>
        <input
          type="time"
          name="appointmentTime"
          id="appointmentTime"
          value={appointmentData.appointmentTime}
          onChange={(event) => handleChange(event)}
        ></input>
        <label>Additional notes (optional)</label>
        <textarea
          name="appointmentAdditionalNote"
          id="appointmentAdditionalNote"
          value={appointmentData.appointmentAdditionalNote}
          onChange={(event) => handleChange(event)}
        />
        <button type="submit" disabled={!isFormValid}>
          Send Request
        </button>
      </form>
      <Modal isShown={isBookingFormModalShown} onClose={toggleModal}>
        <p className="modalPopUpMessage">{modalPopUpMessage}</p>
      </Modal>
    </div>
  );
}

export default BookingForm;
