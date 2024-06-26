import  { useNavigate } from "react-router-dom"
import { useState } from "react";
import {loginUser, logOutUser, auth, onAuthStateChanged} from "./Auth";

function LoginPage(){
    let navigate = useNavigate();
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [user, setUser] = useState({});
    onAuthStateChanged(auth, (currentUser)=>{
        setUser(currentUser);
    })

    const handleLogin = async(event) =>{
        event.preventDefault();
            try{
                const result = await loginUser(loginEmail, loginPassword);
                if (result !== null){
                    navigate('/MainPage')
                } else {
                    console.error('Error creating user');
                }
            } catch (error){
                console.error("Error registering user:", error);
            }
    }

    return(
        <div>
            <button onClick={() => navigate(-1)}> ⬅ </button>
            <form onSubmit={handleLogin}>
                <label>Email</label>
                <input onChange={(event) => setLoginEmail(event.target.value)}/>
                <label>Password</label>
                <input onChange={(event) => setLoginPassword(event.target.value)}/>
                <button type="submit">Login</button>
            </form>
            {user?.email}
            <button onClick={logOutUser}>Sign Out</button>
        </div>
    )
}

export default LoginPage;
