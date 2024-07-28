import { Server } from "socket.io";
import { database } from "./FirebaseConfig.js";
import cors from "cors";
import express from "express";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import axios from "axios";
const PORT = process.env.PORT || 3000;
const app = express();
const GOOGLE_PLACES_KEY="AIzaSyDiMeYprJDeYoM-WclTeU2mHqS4PfEJmaY"

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5173/BookingPage",
      "http://localhost:5173/MainPage",
      "http://localhost:5173/Header",
      "http://localhost:5173/UserProfile",
      "http://localhost:5173/NotificationsPage",
      "https://serviceitt.netlify.app",
      "https://serviceitt.netlify.app/BookingPage",
      "https://serviceitt.netlify.app/MainPage",
      "https://serviceitt.netlify.app/Header",
      "https://serviceitt.netlify.app/UserProfile",
      "https://serviceitt.netlify.app/NotificationsPage",
      "https://serviceitbackend.onrender.com",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

const server = app.listen(PORT, () => {

});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    pingInterval: 25000,
    pingTimeout: 60000,
  },
});

const fetchPlacesAutocomplete = async (query) => {
  const apiKey = GOOGLE_PLACES_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching locations:", error.message);
  }
};

// Express route to handle autocomplete requests
app.get("/places-autocomplete", async (req, res) => {
  const { input } = req.query;

  try {
    const data = await fetchPlacesAutocomplete(input);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
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

let sentNotifications = {};
const resetSentNotifications = (userID) => {
  sentNotifications[userID] = false;
};

io.on("connection", (socket) => {
  socket.on("newUser", async (userID) => {
    addNewUser(userID, socket.id);
  });

  socket.on("disconnect", () => {
    const user = onlineUsers.find((user) => user.socketID === socket.id);
    if (user !== undefined && user !== null) {
      resetSentNotifications(user.userID);
      removeUser(socket.id);
    }
  });

  socket.on("error", (err) => {
    socket.close();
  });

  const DATABASE_FOLDER_NAME = "users";
  const NOTIFICATIONS_FOLDER_NAME = "Notifications";

  socket.on(
    "sendReminder",
    async ({
      userID,
      vendorID,
      customerUsername,
      vendorUsername,
      appointmentTime,
    }) => {
      const receiver1 = getUser(userID);
      const receiver2 = getUser(vendorID);

      const customerReminder = {
        message: `You have an appointment tomorrow with ${vendorUsername} at ${appointmentTime}`,
      };
      const vendorReminder = {
        message: `You have a service to render to ${customerUsername} at ${appointmentTime}`,
      };

      if (receiver1 !== undefined) {
        io.to(receiver1.socketID).emit("getReminder", customerReminder);
      }

      if (receiver2 !== undefined) {
        io.to(receiver2.socketID).emit("getReminder", vendorReminder);
      }

      try {
        await addDoc(
          collection(
            database,
            DATABASE_FOLDER_NAME,
            userID,
            NOTIFICATIONS_FOLDER_NAME
          ),
          customerReminder
        );
        await addDoc(
          collection(
            database,
            DATABASE_FOLDER_NAME,
            vendorID,
            NOTIFICATIONS_FOLDER_NAME
          ),
          customerReminder
        );
      } catch (error) {
        throw new Error(`Error storing notification:" ${error}`);
      }
    }
  );

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
        io.to(receiver.socketID).emit("getNotification", receiverNotification);
      }

      if (sender !== undefined) {
        io.to(sender.socketID).emit("getNotification", senderNotification);
      }

      try {
        await addDoc(
          collection(
            database,
            DATABASE_FOLDER_NAME,
            receiverID,
            NOTIFICATIONS_FOLDER_NAME
          ),
          collection(
            database,
            DATABASE_FOLDER_NAME,
            receiverID,
            NOTIFICATIONS_FOLDER_NAME
          ),
          receiverNotification
        );
        await addDoc(
          collection(
            database,
            DATABASE_FOLDER_NAME,
            senderID,
            NOTIFICATIONS_FOLDER_NAME
          ),
          senderNotification
        );
      } catch (error) {
        throw new Error(`Error storing notification:" ${error}`);
      }
    }
  );

  io.emit("firstEvent", "hello, this is test");
});
