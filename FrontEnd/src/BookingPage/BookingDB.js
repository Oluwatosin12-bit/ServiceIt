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
} from "firebase/firestore";

const DATABASE_FOLDER_NAME = "users";
const requestAppointment = async (
  userUID,
  vendorUID,
  appointmentData,
  userData
) => {
  try {
    const Status = "pending";
    const customerUsername = userData.UserName;
    const vendorAppointmentDataWithStatus = {
      ...appointmentData,
      userUID,
      customerUsername,
      Status,
    };
    const userAppointmentDataWithStatus = {
      ...appointmentData,
      vendorUID,
      customerUsername,
      Status,
    };

    const userDocRef = doc(database, DATABASE_FOLDER_NAME, userUID);
    const userAppointmentCollection = collection(userDocRef, "Appointments");
    const userAppointmentDocRef = doc(
      userAppointmentCollection,
      userAppointmentDataWithStatus.appointmentTitle
    );
    await setDoc(userAppointmentDocRef, userAppointmentDataWithStatus);

    const vendorDocRef = doc(database, DATABASE_FOLDER_NAME, vendorUID);
    const vendorAppointmentCollection = collection(
      vendorDocRef,
      "Appointments"
    );
    const vendorAppointmentDocRef = doc(
      vendorAppointmentCollection,
      vendorAppointmentDataWithStatus.appointmentTitle
    );
    await setDoc(vendorAppointmentDocRef, vendorAppointmentDataWithStatus);
  } catch (error) {
    throw new Error(`Error booking an appointment: ${error.message}`);
  }
};

const vendorAppointmentNotification = (vendorId, callback) => {
  try {
    if (vendorId === undefined) {
      throw new Error(`Invalid userId`);
    }
    const vendorAppointmentCollectionRef = query(
      collection(database, DATABASE_FOLDER_NAME, vendorId, "Appointments")
    );
    const unsubscribe = onSnapshot(
      vendorAppointmentCollectionRef,
      (snapshot) => {
        const notifications = [];
        snapshot.forEach((doc) => {
          notifications.push(doc.data());
        });
        callback(notifications);
      }
    );
    return unsubscribe;
  } catch (error) {
    throw new Error(`Error sending notification:${error.message}`);
  }
};

const userAppointmentNotification = (userId, callback) => {
  try {
    if (userId === undefined) {
      throw new Error(`Invalid userId:${error.message}`);
    }
    const userAppointmentCollectionRef = query(
      collection(database, DATABASE_FOLDER_NAME, userId, "Appointments")
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
    throw new Error(`Error sending notification:${error.message}`);
  }
};

export {
  requestAppointment,
  vendorAppointmentNotification,
  userAppointmentNotification,
};
