import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Layout from "./Layout";
import Header from "./Header";
import LoginPage from "./UserAuthentication/LoginPage";
import SignUpPage from "./UserAuthentication/SignUpPage";
import LandingPage from "./UserAuthentication/LandingPage";
import ResetPasswordPage from "./UserAuthentication/ResetPasswordPage";
import MainPage from "./HomePage/MainPage";
import UserProfile from "./ProfilePage/UserProfile";
import BookingForm from "./BookingPage/BookingPage";
import NotificationsPage from "./Notifications/NotificationsPage";
import AppointmentPage from "./Appointment/AppointmentPage";
import AlternateSignUp from "./UserAuthentication/AlternateSignUp"
import { getUserData } from "./UserAuthentication/FirestoreDB";
import { useUID } from "./UserAuthentication/Auth";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ThemeProvider } from "./UseContext";
import EntryPage from "./UserAuthentication/EntryPage"

function App() {
  const userUID = useUID();
  const [userData, setUserData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [theme, setTheme] = useState("dark");

  const fetchData = async () => {
    if (userUID !== null) {
      const data = await getUserData(userUID);
      setUserData(data);
    }
  };
  useEffect(() => {
    fetchData();
  }, [userUID]);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
    });

    newSocket.on("disconnect", (reason) => {
    });

    newSocket.on("reconnect", (attemptNumber) => {
    });

    newSocket.on("firstEvent", (msg) => {
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("firstEvent", (msg) => {
      });
    }
  }, [socket]);


  useEffect(() => {
    if (socket && userUID) {
      socket.emit("newUser", userUID);
    }
  }, [socket, userUID]);


  return (
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage socket={socket} />} />
          <Route path="/EntryPage" element={<EntryPage socket={socket} />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/SignUpPage" element={<SignUpPage theme={theme} />} />
          <Route path="/SignUpPages" element={<AlternateSignUp theme={theme} />} />
          <Route path="/ResetPasswordPage" element={<ResetPasswordPage />} />
          <Route element={<Layout userData={userData} socket={socket} />}>
            <Route
              path="/MainPage"
              element={
                <MainPage
                  userUID={userUID}
                  userData={userData}
                  socket={socket}
                />
              }
            />
            <Route
              path="/UserProfile"
              element={
                <UserProfile
                  userUID={userUID}
                  userData={userData}
                  socket={socket}
                />
              }
            />
            <Route
              path="/BookingPage"
              element={<BookingForm userData={userData} socket={socket} />}
            />
            <Route
              path="/NotificationsPage"
              element={
                <NotificationsPage userData={userData} socket={socket} />
              }
            />
            <Route
              path="/AppointmentPage"
              element={<AppointmentPage userData={userData} socket={socket}/>}
            />
          </Route>
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
