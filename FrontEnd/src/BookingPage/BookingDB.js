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
const FAVORITES_COLLECTION = "Favorites";
const PENDING_STATUS = "pending";
const ACCEPTED_STATUS = "accepted";
const DECLINED_STATUS = "declined";
const PAST_APPOINTMENT_STATUS = "passed";

const requestAppointment = async (
  userUID,
  vendorUID,
  vendorUsername,
  appointmentData,
  userData,
  vendorEmail,
  vendorName,
  postID,
  image
) => {
  try {
    const Status = PENDING_STATUS;
    const customerUsername = userData.UserName;
    const customerName = userData?.Name;
    const appointmentID = generateRandomID();
    const appointmentDataWithStatus = {
      ...appointmentData,
      customerUID: userUID,
      vendorUID,
      vendorUsername,
      customerUsername,
      Status,
      customerEmail: userData.Email,
      vendorEmail,
      docID: appointmentID,
      customerName,
      vendorName,
      postID,
      postImage: image,
    };
    const userDocRef = doc(
      database,
      DATABASE_FOLDER_NAME,
      userUID,
      APPOINTMENT_COLLECTION,
      appointmentID
    );
    await setDoc(userDocRef, appointmentDataWithStatus);

    const vendorDocRef = doc(
      database,
      DATABASE_FOLDER_NAME,
      vendorUID,
      APPOINTMENT_COLLECTION,
      appointmentID
    );
    await setDoc(vendorDocRef, appointmentDataWithStatus);
  } catch (error) {
    throw new Error(`Error booking an appointment: ${error.message}`);
  }
};

const generateRandomID = () => {
  return Math.random().toString(36).substring(2);
};

const fetchNotifications = (userID, callback) => {
  try {
    if (userID === undefined) {
      throw new Error(`Invalid userID: ${error.message}`);
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
    throw new Error(`Error sending appointment notification: ${error.message}`);
  }
};

const fetchUserFavorites = (userID, callback) => {
  try {
    if (userID === undefined) {
      throw new Error(`Invalid userID: ${error.message}`);
    }
    const userFavoritesRef = query(
      collection(database, DATABASE_FOLDER_NAME, userID, FAVORITES_COLLECTION)
    );
    const unsubscribe = onSnapshot(userFavoritesRef, (snapshot) => {
      const favorites = [];
      snapshot.forEach((doc) => {
        const favorite = doc.data();
        favorites.push(favorite);
      });
      callback(favorites);
    });
    return unsubscribe;
  } catch (error) {
    throw new Error(`Error sending appointment notification: ${error.message}`);
  }
};

const fetchPendingAppointments = (userID, socket, callback) => {
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

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const pendingAppointmentsData = [];
      const today = new Date();
      const twoDaysFromNow = new Date(today);
      twoDaysFromNow.setDate(today.getDate() + 2);
      const twoDaysFromNowStr = twoDaysFromNow.toISOString().split("T")[0];

      const promises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const appointmentDate = new Date(data.appointmentDate);
        const appointmentDateStr = appointmentDate.toISOString().split("T")[0];

        pendingAppointmentsData.push({ docID: doc.id, ...data });

        if (appointmentDateStr === twoDaysFromNowStr) {
          await socket.emit("sendNotice", {
            userID: userID,
            vendorID: data.vendorUID,
            customerUsername: data.customerUsername,
            vendorUsername: data.vendorUsername,
            appointmentTime: data.appointmentDate,
          });
        }
      });

      await Promise.all(promises);
      callback(pendingAppointmentsData);
    });

    return unsubscribe;
  } catch (error) {
    throw new Error(
      `Error fetching pending appointment data: ${error.message}`
    );
  }
};

const fetchUpcomingAppointments = (userID, socket, callback) => {
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
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const upcomingAppointmentsData = [];
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const todayDateStr = today.toISOString().split("T")[0];
      const tomorrowDateStr = tomorrow.toISOString().split("T")[0];

      const promises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const appointmentDateStr = data.appointmentDate;
        upcomingAppointmentsData.push({ docID: doc.id, ...data });

        if (appointmentDateStr === tomorrowDateStr) {
          await socket.emit("sendReminder", {
            userID: userID,
            vendorID: data.vendorUID,
            customerUsername: data.customerUsername,
            vendorUsername: data.vendorUsername,
            appointmentTime: appointmentDateStr,
          });
        }

        if (appointmentDateStr < todayDateStr) {
          await pastAppointment(userID, data.vendorUID, data.docID);
        }
      });
      await Promise.all(promises);

      upcomingAppointmentsData.sort((a, b) => {
        return new Date(a.appointmentDate) - new Date(b.appointmentDate);
      });

      callback(upcomingAppointmentsData);
    });

    return unsubscribe;
  } catch (error) {
    throw new Error(
      `Error fetching upcoming appointment data: ${error.message}`
    );
  }
};

const fetchPastAppointments = (userID, callback) => {
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
      where("Status", "==", PAST_APPOINTMENT_STATUS)
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
    throw new Error(
      `Error fetching past appointment data: ${error.message}`
    );
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

const pastAppointment = async (userID, vendorID, appointmentID) => {
  const userAppointmentRef = doc(
    database,
    DATABASE_FOLDER_NAME,
    userID,
    APPOINTMENT_COLLECTION,
    appointmentID
  );
  await updateDoc(userAppointmentRef, {
    Status: PAST_APPOINTMENT_STATUS,
  });

  const vendorAppointmentRef = doc(
    database,
    DATABASE_FOLDER_NAME,
    vendorID,
    APPOINTMENT_COLLECTION,
    appointmentID
  );
  await updateDoc(vendorAppointmentRef, {
    Status: PAST_APPOINTMENT_STATUS,
  });
};

export {
  requestAppointment,
  fetchNotifications,
  fetchUserFavorites,
  fetchPendingAppointments,
  fetchUpcomingAppointments,
  acceptAppointment,
  declineAppointment,
  generateRandomID,
  fetchPastAppointments,
};
