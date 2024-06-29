import  { useNavigate } from "react-router-dom";
import './LandingPage.css';

function LandingPage(){
    const navigate = useNavigate();
    const handleLoginRoute = () =>{
        navigate(`/LoginPage`);
    };
    const handleSignUpRoute = () =>{
        navigate(`/SignUpPage`);
    };

    return(
        <div className="landingPageContent">
            <div className="landingPageText">
                <h1 className="welcome">Welcome</h1>
                <p className="description">An online marketplace to give your services a platform</p>
                <button className="loginButton" onClick={handleLoginRoute}>Login</button>
                <button className="signUpButton" onClick={handleSignUpRoute}>SignUp</button>
            </div>
            <div>
                <img className="landingImage" src="src/Images/coworking-woman-doing-online-shopping-at-home.gif"/>
            </div>
        </div>
    )
};

export default LandingPage
