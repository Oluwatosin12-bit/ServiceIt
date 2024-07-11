import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Header";
import LoginPage from "./UserAuthentication/LoginPage";
import SignUpPage from "./UserAuthentication/SignUpPage";
import LandingPage from "./UserAuthentication/LandingPage";
import ResetPasswordPage from "./UserAuthentication/ResetPasswordPage";
import MainPage from "./HomePage/MainPage";
import UserProfile from "./ProfilePage/UserProfile";
import BookingForm from "./BookingPage/BookingPage";
import NotificationsPage from "./Notifications/NotificationsPage";
import { getUserData } from "./UserAuthentication/FirestoreDB";
import { useUID } from "./UserAuthentication/Auth";
import { useEffect, useState } from "react";

function App() {
  const userUID = useUID();
  const [userData, setUserData] = useState(null);
  const fetchData = async () => {
    if (userUID !== null) {
      const data = await getUserData(userUID);
      setUserData(data);
    }
  };
  useEffect(() => {
    fetchData();
  }, [userUID]);

  return (
    <Router>
      <Header userData={userData} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/SignUpPage" element={<SignUpPage />} />
        <Route
          path="/MainPage"
          element={<MainPage userUID={userUID} userData={userData} />}
        />
        <Route path="/ResetPasswordPage" element={<ResetPasswordPage />} />
        <Route
          path="/UserProfile"
          element={<UserProfile userUID={userUID} userData={userData} />}
        />
        <Route
          path="/BookingPage"
          element={<BookingForm userData={userData} />}
        />
        <Route
          path="/NotificationsPage"
          element={<NotificationsPage userData={userData} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
