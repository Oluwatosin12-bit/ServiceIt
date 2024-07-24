import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Layout from "./Layout";
import LoginPage from "./UserAuthentication/LoginPage";
import SignUpPage from "./UserAuthentication/SignUpPage";
import LandingPage from "./UserAuthentication/LandingPage";
import AlternateSignUp from "./UserAuthentication/AlternateSignUp"
import ResetPasswordPage from "./UserAuthentication/ResetPasswordPage";
import MainPage from "./HomePage/MainPage";
import UserProfile from "./ProfilePage/UserProfile";
import VendorProfile from "./ProfilePage/VendorsProfile";
import BookingForm from "./BookingPage/BookingPage";
import NotificationsPage from "./Notifications/NotificationsPage";
import AppointmentPage from "./Appointment/AppointmentPage";
import FavoritesPage from "./Favorites/FavoritesPage";
import HistoryPage from "./Appointment/HistoryPage";
import { getUserData } from "./UserAuthentication/FirestoreDB";
import { useUID } from "./UserAuthentication/Auth";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ThemeProvider, SearchWordProvider } from "./UseContext";
import EntryPage from "./UserAuthentication/EntryPage"
import populateDatabase from "./PopulateDatabase/AddToDatabase";
import populatePosts from "./PopulateDatabase/PopulatePostsDB"
function App() {
  const userUID = useUID();
  const [userData, setUserData] = useState(null);
  const [socket, setSocket] = useState(null);

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
    const newSocket = io("https://serviceitbackend.onrender.com");
    setSocket(newSocket);

    newSocket.on("connect", () => {
    });

    newSocket.on("disconnect", (reason) => {
    });

    newSocket.on("reconnect", (attemptNumber) => {
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket !==null) {
      socket.on("firstEvent", (msg) => {
      });
    }
  }, [socket]);


  useEffect(() => {
    if (socket !==null && userUID !==null) {
      socket.emit("newUser", userUID);
    }
  }, [socket, userUID]);


  return (
      <Router>
      <ThemeProvider>
      <SearchWordProvider>
        <Routes>
          <Route path="/" element={<LandingPage socket={socket} />} />
          <Route path="/EntryPage" element={<EntryPage socket={socket} />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/SignUpPages" element={<AlternateSignUp />} />
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
              path="/VendorProfile"
              element={
                <VendorProfile
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
            <Route
              path="/FavoritesPage"
              element={<FavoritesPage userData={userData} socket={socket}/>}
            />
            <Route
              path="/HistoryPage"
              element={<HistoryPage userData={userData} socket={socket}/>}
            />
          </Route>
        </Routes>
        </SearchWordProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
