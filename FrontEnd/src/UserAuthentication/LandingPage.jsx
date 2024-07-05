import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landingPageContent">
      <div className="landingPageText">
        <h1 className="welcome">Welcome</h1>
        <p className="description">
          An online marketplace to give your services a platform
        </p>
        <Link to="/LoginPage">
          <button className="loginButton">Login</button>
        </Link>
        <Link to="SignUpPage">
          <button className="signUpButton">SignUp</button>
        </Link>
      </div>
      <div>
        <img
          className="landingImage"
          src="src/Images/coworking-woman-doing-online-shopping-at-home.gif"
        />
      </div>
    </div>
  );
}

export default LandingPage;
