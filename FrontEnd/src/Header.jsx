import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "./UseContext";
import { logOutUser } from "./UserAuthentication/Auth";
import "./Header.css";
import NotificationsPage from "./Notifications/NotificationsPage";
function Header({ userData, socket }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(true);
  const [invisibleComponent, setInvisibleComponent] = useState(false);
  const { theme, setTheme } = useTheme();
  const handleThemeChange = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (socket) {
      socket.on("getNotification", (data) => {
        setNotifications((prev) => [...prev, data]);
      });
    }
  }, [socket]);

  const handleReadAll = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  const handleLogOut = async () => {
    try {
      const logOutConfirmation = window.confirm(
        "Are you sure you want to sign out?"
      );
      if (logOutConfirmation === true) {
        await logOutUser();
        navigate("/");
      }
    } catch (error) {
      throw new Error(`Error logging out: ${error.message}`);
    }
  };

  return (
    <div className={`headerSection ${theme}`}>
      <div>
        <h2>ServiceIt</h2>
      </div>
      <div className="userName">
        <p>Hello, {userData?.UserName}!</p>
      </div>
      <nav className="navigation">
        <ul className="navigationList">
          <li>
            <NavLink to="/MainPage">
              <p>Home</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/AppointmentPage">
              <p>Appointments</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/FavoritesPage">
              <p>Favorites</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/HistoryPage">
              <p>History</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/NotificationsPage">
              <i className="fa-solid fa-bell profileIcon"></i>
              {notifications.length > 0 && (
                <div className="counter">{notifications.length}</div>
              )}
            </NavLink>
          </li>
          <li>
            <button className="toggleBtns" onClick={handleThemeChange}>
              <i
                className={`far ${theme === "light" ? "fa-moon" : "fa-sun"}`}
              ></i>
            </button>
          </li>
          <li>
            <NavLink to="/UserProfile">
              <i className="fa-solid fa-user profileIcon"></i>
            </NavLink>
          </li>
          <li>
            <p onClick={handleLogOut} className="signOut">Sign Out</p>
          </li>
        </ul>
      </nav>
      {isNotificationsOpen && notifications.length > 0 && (
        <div className="popNotifications">
          {notifications.map((notification, index) => (
            <div key={index}>
              <p>{notification.message}</p>
            </div>
          ))}
          <button className="notificationButton" onClick={handleReadAll}>
            Mark as read
          </button>
        </div>
      )}
      {invisibleComponent && (
        <NotificationsPage notifications={notifications} />
      )}
    </div>
  );
}

export default Header;
