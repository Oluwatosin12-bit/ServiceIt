import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "./UseContext";
import "./Header.css";
import NotificationsPage from "./Notifications/NotificationsPage";
function Header({ userData, socket }) {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setisNotificationsOpen] = useState(true);
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
    setisNotificationsOpen(false);
  };

  return (
    <div className={`headerSection ${theme}`}>
      <div>
        <h2>ServiceIt</h2>
      </div>
      <div>
        <p>Hello, {userData?.FirstName}!</p>
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
            <NavLink to="">
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
            <NavLink to="/UserProfile">
              <i className="fa-solid fa-user profileIcon"></i>
            </NavLink>
          </li>
          <li>
            <button className="toggleBtn" onClick={handleThemeChange}>
              <i
                className={`far ${theme === "light" ? "fa-moon" : "fa-sun"}`}
              ></i>
            </button>
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
