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
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

const userAppointmentChanges = (userID) => {
  const userAppointmentCollectionRef = collection(
    database,
    DATABASE_FOLDER_NAME,
    userID,
    APPOINTMENT_COLLECTION
  );

  const unsubscribe = onSnapshot(userAppointmentCollectionRef, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const appointmentData = change.doc.data();
      const customerID = appointmentData.customerUID

      if (change.type === "added") {
        const userNotificationMessage = `You just requested an appointment on ${appointmentData.appointmentDate} with ${appointmentData.vendorUsername} for ${appointmentData.appointmentTitle}`;
        await addNotification(customerID, userNotificationMessage);
      }
    });
  });

  return unsubscribe;
};

const vendorAppointmentChanges = (userID) => {
  const userAppointmentCollectionRef = collection(
    database,
    DATABASE_FOLDER_NAME,
    userID,
    APPOINTMENT_COLLECTION
  );

  const unsubscribe = onSnapshot(userAppointmentCollectionRef, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const appointmentData = change.doc.data();
      const vendorID = appointmentData.vendorUID;

      if (change.type === "added") {
        const vendorNotificationMessage = `A new service request has been made by ${appointmentData.customerUsername} for ${appointmentData.appointmentTitle}`;
       if (userID === vendorID){
        await addNotification(userID, vendorNotificationMessage);
       }
      }
    });
  });

  return unsubscribe;
};

const addNotification = async (ID, message) => {
  try {
    const userDocRef = doc(database, DATABASE_FOLDER_NAME, ID);
    const notificationCollectionRef = collection(userDocRef, NOTIFICATION_COLLECTION);

    const snapshot = await getDocs(notificationCollectionRef);
    const existingNotifications = snapshot.docs.map((doc) => doc.data().message);

    if (snapshot.empty || !existingNotifications.includes(message)) {
      await addDoc(notificationCollectionRef, {
        message: message,
        timestamp: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error(`Error adding notification: ${error.message}`);
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
      const uniqueMessages = new Set();
      const notifications = [];
      snapshot.forEach((doc) => {
        const notification = doc.data();
        const message = notification.message;
        if (uniqueMessages.has(message) !== true) {
          uniqueMessages.add(message);
          notifications.push(notification);
        }
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
  userAppointmentChanges,
  vendorAppointmentChanges,
  addNotification,
  fetchNotifications,
  fetchPendingAppointments,
  fetchUpcomingAppointments,
  acceptAppointment,
  declineAppointment,
};
