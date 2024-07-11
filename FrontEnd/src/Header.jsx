import { NavLink } from "react-router-dom";
import {useState} from "react"
import "./Header.css";
function Header({ userData }) {
  return (
    <div className="headerSection">
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
            <NavLink to="">
              <p>Favorites</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="">
              <p>History</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="">
              <p>About Us</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/NotificationsPage">
              <i className="fa-solid fa-bell profileIcon"></i>
            </NavLink>
          </li>
          <li>
            <NavLink to="/UserProfile">
              <i className="fa-solid fa-user profileIcon"></i>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Header;
