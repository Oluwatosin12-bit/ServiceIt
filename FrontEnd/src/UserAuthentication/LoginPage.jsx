import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser, logOutUser } from "./Auth";
import "./LoginPage.css";


function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUpRoute = () => {
    navigate(`/SignUpPage`);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const result = await loginUser(email, password);
      if (result === true) {
        navigate("/MainPage");
      } else {
        console.error("Error logging user");
      }
    } catch (error) {
      console.error("Error logging in user:", error);
    }
  };

  return (
    <div>
      <button className="backButton" onClick={() => navigate(-1)}> ⬅ </button>
      <div className="loginPageContent">
        <div className="loginForm">
          <form onSubmit={handleLogin}>
            <h3>Login Form</h3>
            <div className="loginEmail">
              <label htmlFor="email">Email</label>
              <input
                name="email"
                required="required"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter Email address..."
              />
            </div>

            <div className="loginPassword">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                required="required"
                type="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter Password..."
              />
            </div>

            <div className="linkOut">
              <p className="linkToResetPassword">Forgot Password?</p>
              <a className="linkToSignUp" onClick={handleSignUpRoute}>
                Sign Up
              </a>
            </div>

            <div>
              <button className="sendLoginButton" type="submit" onClick={handleLogin}>
                Login
              </button>
            </div>
          </form>
        </div>
        <div>
          <img
            className="loginImage"
            src="src/Images/coworking-woman-doing-online-shopping-at-home.gif"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
