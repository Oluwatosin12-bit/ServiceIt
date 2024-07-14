import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css";
import NotificationsPage from "./Notifications/NotificationsPage";
function Header({ userData, socket}) {
  const [notifications, setNotifications] = useState([])
  const [invisibleComponent, setInvisibleComponent] = useState(false)
  useEffect(()=>{
    if(socket){
      socket.on("getNotification", data=>{
        setNotifications((prev)=>[...prev, data])
      })
    }
  },[socket])
  const displayNotification = ({senderName, type})=>{
    let action;

    if (type===1){
      action="favorited"
    } else if(type===2){
      action="added"
    } else if(type===3){
      action="accepted"
    } else if(type===4){
      action="declined"
    }
    return(
      <span>{`${senderName} ${action} your appointment`}</span>
    )
  }

  console.log(notifications)
  console.log(socket)
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
            <NavLink to="/NotificationsPage">
              <i className="fa-solid fa-bell profileIcon"></i>
              {notifications.length>0 && <div className="counter">0</div>}

            </NavLink>
          </li>
          <li>
            <NavLink to="/UserProfile">
              <i className="fa-solid fa-user profileIcon"></i>
            </NavLink>
          </li>
        </ul>
      </nav>
      {invisibleComponent &&(
        <NotificationsPage notifications={notifications}/>
      )}
      {notifications.map((n)=> displayNotification(n))}
    </div>
  );
}

export default Header;
