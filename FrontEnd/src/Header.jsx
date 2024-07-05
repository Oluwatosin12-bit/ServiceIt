import { Link } from "react-router-dom";
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
            <Link to="/MainPage">
              <p>Home</p>
            </Link>
          </li>
          <li>
            <Link to="">
              <p>Appointments</p>
            </Link>
          </li>
          <li>
            <Link to="">
              <p>Favorites</p>
            </Link>
          </li>
          <li>
            <Link to="">
              <p>History</p>
            </Link>
          </li>
          <li>
            <Link to="">
              <p>About Us</p>
            </Link>
          </li>
          <li>
            <Link to="/UserProfile">
              <i className="fa-solid fa-bell profileIcon"></i>
            </Link>
          </li>
          <li>
            <Link to="/UserProfile">
              <i className="fa-solid fa-user profileIcon"></i>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Header;
