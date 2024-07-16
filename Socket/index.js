import { Server } from "socket.io";
import { database } from "./FirebaseConfig.js";
import {
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

const io = new Server({
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5173/BookingPage",
      "http://localhost:5173/MainPage",
      "http://localhost:5173/Header",
      "http://localhost:5173/UserProfile",
      "http://localhost:5173/NotificationsPage",
    ],
    pingInterval: 25000,
    pingTimeout: 60000,
  },
});

let onlineUsers = [];
const addNewUser = (userID, socketID) => {
  if (!onlineUsers.some((user) => user.userID === userID)) {
    onlineUsers.push({ userID, socketID });
  } else {
    // Update socketID if user already exists (reconnection)
    onlineUsers = onlineUsers.map((user) =>
      user.userID === userID ? { ...user, socketID } : user
    );
  }
};

const removeUser = (socketID) => {
  onlineUsers = onlineUsers.filter((user) => user.socketID !== socketID);
};

const getUser = (userID) => {
  return onlineUsers.find((user) => user.userID === userID);
};

const constructMessage = (
  userID,
  receivee,
  senderName,
  receiverName,
  appointmentDate,
  appointmentTitle,
  postTitle,
  type
) => {
  let action;
  if (type === 1) {
    action = "favorited";
    if (userID === receivee) {
      return `You ${action} ${receiverName}'s post on ${postTitle}`;
    } else {
      return `${senderName} ${action} your post on ${postTitle}`;
    }
  } else if (type === 2) {
    action = "requested";
    if (userID === receivee) {
      return `You ${action} an appointment with ${receiverName} for ${appointmentTitle}`;
    } else {
      return `${senderName} ${action} an appointment for ${appointmentTitle}`;
    }
  } else if (type === 3) {
    action = "accepted";
    if (userID === receivee) {
      return `Your appointment with ${receiverName} for ${appointmentTitle} has been ${action}`;
    } else {
      return `You ${action} an appointment with ${senderName} for ${appointmentTitle}`;
    }
  } else if (type === 4) {
    action = "declined";
    if (userID === receivee) {
      return `Your appointment with ${receiverName} for ${appointmentTitle} has been ${action}`;
    } else {
      return `You ${action} an appointment with ${senderName} for ${appointmentTitle}`;
    }
  }
};

io.on("connection", (socket) => {
  socket.on("newUser", async (userID) => {
    addNewUser(userID, socket.id);

    const notificationsRef = collection(
      database,
      "users",
      userID,
      "Notifications"
    );
    const q = query(
      notificationsRef,
      where("status", "==", "unread"),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      socket.emit("getNotification", doc.data());
      await updateDoc(doc.ref, { status: "read" });
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });

  socket.on("error", (err) => {
    socket.close();
  });

  socket.on(
    "sendNotification",
    async ({
      userID,
      senderID,
      receiverID,
      senderName,
      receiverName,
      appointmentDate = null,
      appointmentTitle = null,
      postTitle = null,
      type,
    }) => {
      const receiver = getUser(receiverID);
      const sender = getUser(senderID);
      const senderMessage = constructMessage(
        userID,
        senderID,
        senderName,
        receiverName,
        appointmentDate,
        appointmentTitle,
        postTitle,
        type
      );
      const receiverMessage = constructMessage(
        userID,
        receiverID,
        senderName,
        receiverName,
        appointmentDate,
        appointmentTitle,
        postTitle,
        type
      );

      const status = "unread";
      const senderNotification = {
        message: senderMessage,
        timestamp: Timestamp.now(),
        status,
      };

      const receiverNotification = {
        message: receiverMessage,
        timestamp: Timestamp.now(),
        status,
      };

      if (receiver !== undefined) {
        io.to(receiver.socketID).emit("getNotification", {
          ...receiverNotification,
          timestamp: receiverNotification.timestamp.toMillis(),
        });
      }

      if (sender !== undefined) {
        io.to(sender.socketID).emit("getNotification", {
          ...senderNotification,
          timestamp: senderNotification.timestamp.toMillis(), // Convert to milliseconds
        });
      }

      try {
        await addDoc(
          collection(database, "users", receiverID, "Notifications"),
          receiverNotification
        );
        await addDoc(
          collection(database, "users", senderID, "Notifications"),
          senderNotification
        );
      } catch (error) {
        throw new Error(`Error storing notification:" ${error}`);
      }
    }
  );

  io.emit("firstEvent", "hello, this is test");
});

io.listen(5000);
