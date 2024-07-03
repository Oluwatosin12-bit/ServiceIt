import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserData } from "../UserAuthentication/FirestoreDB";
import { getUID } from "../UserAuthentication/Auth";
import "./MainPage.css";

function MainPage() {
  const navigate = useNavigate();
  const userUID = getUID();
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      if (userUID) {
        const data = await getUserData(userUID);
        setUserData(data);
      }
    };
    fetchData();
  }, [userUID]);
  const handleUserProfileRoute = () => {
    navigate("/UserProfile");
  };

  return (
    <div>
      <div className="welcomePlace">
        <h1>Welcome {userData?.FirstName}! </h1>
      </div>
      <i
        className="fa-solid fa-user profileIcon"
        onClick={handleUserProfileRoute}
      ></i>
    </div>
  );
}

export default MainPage;
