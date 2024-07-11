import { database } from "../UserAuthentication/FirebaseConfig";
import {
  query,
  where,
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";

const DATABASE_FOLDER_NAME = "users";
const APPOINTMENT_COLLECTION = "Appointments";
const NOTIFICATION_COLLECTION = "Notifications";
const requestAppointment = async (
  userUID,
  vendorUID,
  vendorUsername,
  appointmentData,
  userData
) => {
  try {
    const Status = "pending";
    const customerUsername = userData.UserName;
    const appointmentDataWithStatus = {
      ...appointmentData,
      customerUID: userUID,
      vendorUID,
      vendorUsername,
      customerUsername,
      Status,
    };

    const userDocRef = doc(database, DATABASE_FOLDER_NAME, userUID);
    const userAppointmentCollection = collection(
      userDocRef,
      APPOINTMENT_COLLECTION
    );
    await addDoc(userAppointmentCollection, appointmentDataWithStatus);

    const vendorDocRef = doc(database, DATABASE_FOLDER_NAME, vendorUID);
    const vendorAppointmentCollection = collection(
      vendorDocRef,
      APPOINTMENT_COLLECTION
    );
    await addDoc(vendorAppointmentCollection, appointmentDataWithStatus);
  } catch (error) {
    throw new Error(`Error booking an appointment: ${error.message}`);
  }
};

const appointmentChanges = (userID) => {
  const userAppointmentCollectionRef = collection(
    database,
    DATABASE_FOLDER_NAME,
    userID,
    APPOINTMENT_COLLECTION
  );

  const unsubscribe = onSnapshot(userAppointmentCollectionRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const appointmentData = change.doc.data();
      const vendorID = appointmentData.vendorUID;

      if (change.type === "added") {
        const notificationMessage = `You just requested an appointment on ${appointmentData.appointmentDate} with ${appointmentData.vendorUsername} for ${appointmentData.appointmentTitle}`;
        addNotification(userID, notificationMessage, appointmentData);

        const vendorNotificationMessage = `A new service request has been made by ${appointmentData.customerUsername} for ${appointmentData.appointmentTitle}`;
        addNotification(vendorID, vendorNotificationMessage, appointmentData);
      } else if (
        change.type === "modified" &&
        appointmentData.Status === "accepted"
      ) {
        const notificationMessage = `Your request has been accepted by ${appointmentData.vendorUsername}`;
        addNotification(userID, notificationMessage, appointmentData);

        const vendorNotificationMessage = `You accepted a service request from ${appointmentData.customerUsername}`;
        addNotification(vendorID, vendorNotificationMessage, appointmentData);
      }
    });
  });

  return unsubscribe;
};

const addNotification = async (ID, message, appointmentData) => {
  try {
    const userDocRef = doc(database, DATABASE_FOLDER_NAME, ID);
    const notificationCollectionRef = collection(
      userDocRef,
      NOTIFICATION_COLLECTION
    );

    const snapshot = await getDocs(notificationCollectionRef);
    const existingNotifications = snapshot.docs.map(
      (doc) => doc.data().message
    );
    if (snapshot.empty || existingNotifications.includes(message) === false) {
      await addDoc(notificationCollectionRef, {
        message: message,
        timestamp: Timestamp.now(),
      });
      return;
    }
  } catch (error) {
    throw new Error(`Error adding notification: ${error.message}`);
  }
};

const fetchNotifications = (userID, callback) => {
  try {
    if (userID === undefined) {
      throw new Error(`Invalid userID:${error.message}`);
    }
    const userAppointmentCollectionRef = query(
      collection(
        database,
        DATABASE_FOLDER_NAME,
        userID,
        NOTIFICATION_COLLECTION
      ),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(userAppointmentCollectionRef, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push(doc.data());
      });
      callback(notifications);
    });
    return unsubscribe;
  } catch (error) {
    throw new Error(`Error sending appointment notification:${error.message}`);
  }
};

export { requestAppointment, appointmentChanges, fetchNotifications };
