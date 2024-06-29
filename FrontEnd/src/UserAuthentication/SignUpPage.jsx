import  {useNavigate} from "react-router-dom";
import {useState} from "react";
import {registerUser} from "./Auth";
import {addUser} from './FirestoreDB';
import './SignUpPage.css';

function SignUpPage(){
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const MIN_PASSWORD_LENGTH = 6;
    const handleLoginRoute = () => {
        navigate(`/LoginPage`);
      };

    const handleSignUp = async(event) =>{
        event.preventDefault();
        if (password.length < MIN_PASSWORD_LENGTH) {
            alert(`Minimum password length is ${MIN_PASSWORD_LENGTH}`);
        } else {
            try{
                const userCredential = await registerUser(email, password);
                if (userCredential!==undefined){
                    addUser(userCredential, firstName, lastName, userName, email);
                    navigate('/MainPage');
                } else{
                    alert("Incorrect Email address");
                };
            } catch (error){
                console.error("Error registering user:", error);
            };
        };
    };
    return(
        <div>
            <button className="backButton" onClick={() => navigate(-1)}> ⬅ </button>
            <div className="signUpPageContent">
                <div>
                    <form className="signUpForm">
                        <h3>Create an account</h3>
                        <div className="signUpFirstName">
                            <label htmlFor="firstName">First name</label>
                            <input name="firstName" onChange={(event) => setFirstName(event.target.value)} required="required"/>
                        </div>
                        <div className="signUpLastName">
                            <label htmlFor="lastName">Last name</label>
                            <input name="lastName" onChange={(event) => setLastName(event.target.value)}/>
                        </div>
                        <div className="signUpEmail">
                            <label htmlFor="email">Email</label>
                            <input name="email" onChange={(event) => setEmail(event.target.value)} placeholder="Enter Email" required="required"/>
                        </div>
                        <div className="signUpUsername">
                            <label htmlFor="username">Username</label>
                            <input name="username" onChange={(event) => setUserName(event.target.value)} required="required"/>
                        </div>
                        <div className="signUpPassword">
                            <label htmlFor="password">Password</label>
                            <input name="password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter Password" />
                        </div>
                        <p className="linkToLogin" onClick={handleLoginRoute}>Already have an account?</p>
                        <button className="sendSignUpButton" onClick={handleSignUp}>Sign Up</button>
                    </form>
                </div>
                <div>
                    <img className="signUpImage" src="src/Images/coworking-woman-doing-online-shopping-at-home.gif"/>
                </div>
            </div>
        </div>

    )
};

export default SignUpPage;
