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
  updateDoc,
} from "firebase/firestore";

const DATABASE_FOLDER_NAME = "users";
const APPOINTMENT_COLLECTION = "Appointments";
const NOTIFICATION_COLLECTION = "Notifications";
const PENDING_STATUS = "pending";
const ACCEPTED_STATUS = "accepted";
const DECLINED_STATUS = "declined";

const requestAppointment = async (
  userUID,
  vendorUID,
  vendorUsername,
  appointmentData,
  userData
) => {
  try {
    const Status = PENDING_STATUS;
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
      console.log(appointmentData);

      if (change.type === "added") {
        const notificationMessage = `You just requested an appointment on ${appointmentData.appointmentDate} with ${appointmentData.vendorUsername} for ${appointmentData.appointmentTitle}`;
        addCustomerNotification(userID, notificationMessage, appointmentData);

      }
    });
  });

  return unsubscribe;
};

const vendorAppointmentChanges = (vendorID) => {
  const userAppointmentCollectionRef = collection(
    database,
    DATABASE_FOLDER_NAME,
    vendorID,
    APPOINTMENT_COLLECTION
  );

  const unsubscribe = onSnapshot(userAppointmentCollectionRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const appointmentData = change.doc.data();
      // const vendorID = appointmentData.vendorUID;
      console.log(appointmentData);

      if (change.type === "added") {
        const vendorNotificationMessage = `A new service request has been made by ${appointmentData.customerUsername} for ${appointmentData.appointmentTitle}`;
        addVendorNotification(vendorID, vendorNotificationMessage, appointmentData);
      }
    });
  });

  return unsubscribe;
};

const addCustomerNotification = async (userID, message, appointmentData) => {
  try {
    const userDocRef = doc(database, DATABASE_FOLDER_NAME, userID);
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
        userID: userID
      });
      return;
    }
  } catch (error) {
    throw new Error(`Error adding notification: ${error.message}`);
  }
};

const addVendorNotification = async (vendorID, message, appointmentData) => {
  try {
    const userDocRef = doc(database, DATABASE_FOLDER_NAME, vendorID);
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
        userID: vendorID
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

const fetchPendingAppointments = (userID, callback) => {
  try {
    if (userID === null) {
      return;
    }
    const q = query(
      collection(
        database,
        DATABASE_FOLDER_NAME,
        userID,
        APPOINTMENT_COLLECTION
      ),
      where("Status", "==", PENDING_STATUS)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pendingAppointmentsData = [];
      querySnapshot.forEach((doc) => {
        pendingAppointmentsData.push({ docID: doc.id, ...doc.data() });
      });

      callback(pendingAppointmentsData);
    });

    return unsubscribe;
  } catch (error) {
    throw new Error(`Error fetching pending appointment data:${error.message}`);
  }
};

const fetchUpcomingAppointments = (userID, callback) => {
  try {
    if (userID === null) {
      return;
    }
    const q = query(
      collection(
        database,
        DATABASE_FOLDER_NAME,
        userID,
        APPOINTMENT_COLLECTION
      ),
      where("Status", "==", ACCEPTED_STATUS)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const upcomingAppointmentsData = [];
      querySnapshot.forEach((doc) => {
        upcomingAppointmentsData.push({ docID: doc.id, ...doc.data() });
      });

      callback(upcomingAppointmentsData);
    });

    return unsubscribe;
  } catch (error) {
    throw new Error(`Error fetching pending appointment data:${error.message}`);
  }
};

const acceptAppointment = async (userID, vendorID, appointmentID) => {
  const userAppointmentRef = doc(
    database,
    DATABASE_FOLDER_NAME,
    userID,
    APPOINTMENT_COLLECTION,
    appointmentID
  );
  await updateDoc(userAppointmentRef, {
    Status: ACCEPTED_STATUS,
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
  const vendorAppointmentRef = doc(
    database,
    DATABASE_FOLDER_NAME,
    vendorID,
    APPOINTMENT_COLLECTION,
    appointmentID
  );
  await updateDoc(vendorAppointmentRef, {
    Status: ACCEPTED_STATUS,
  });
};

const declineAppointment = async (userID, vendorID, appointmentID) => {
  const userAppointmentRef = doc(
    database,
    DATABASE_FOLDER_NAME,
    userID,
    APPOINTMENT_COLLECTION,
    appointmentID
  );
  await updateDoc(userAppointmentRef, {
    Status: DECLINED_STATUS,
  });

  const vendorAppointmentRef = doc(
    database,
    DATABASE_FOLDER_NAME,
    vendorID,
    APPOINTMENT_COLLECTION,
    appointmentID
  );
  await updateDoc(vendorAppointmentRef, {
    Status: DECLINED_STATUS,
  });
};

export {
  requestAppointment,
  appointmentChanges,
  vendorAppointmentChanges,
  fetchNotifications,
  fetchPendingAppointments,
  fetchUpcomingAppointments,
  acceptAppointment,
  declineAppointment,
};
