import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./UserAuthentication/LoginPage";
import SignUpPage from "./UserAuthentication/SignUpPage";
import LandingPage from "./UserAuthentication/LandingPage";
import ResetPasswordPage from "./UserAuthentication/ResetPasswordPage";
import MainPage from "./HomePage/MainPage";
import UserProfile from "./ProfilePage/UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/SignUpPage" element={<SignUpPage />} />
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/ResetPasswordPage" element={<ResetPasswordPage />} />
        <Route path="/UserProfile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
