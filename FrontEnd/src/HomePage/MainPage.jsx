import {useNavigate} from "react-router-dom";
import { useEffect, useState } from 'react';
import { getUID, getUserData } from '../UserAuthentication/FirestoreDB';
import { logOutUser } from '../UserAuthentication/Auth';

function MainPage(){
  const navigate = useNavigate();
  const userUID = getUID();
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (userUID) {
        const data = await getUserData(userUID);
        setUserData(data);
      }
    };
    fetchData();
  }, [userUID]);

  const handleLogOut = async () =>{
    try{
      console.log("clicked")
      await logOutUser();
      console.log("logged out")
      navigate("/");
    } catch(error){
      console.error("Error logging out", error)
    }
  }

    return(
        <div>
            <div className="welcome">
                <h1>Welcome {userData?.FirstName}! </h1>
            </div>
            <button onClick={handleLogOut}>Sign Out</button>
        </div>
    );
};

export default MainPage;
