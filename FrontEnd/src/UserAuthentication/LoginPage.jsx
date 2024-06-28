import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {loginUser} from "./Auth";
import "./LoginPage.css";


function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUpRoute = ()=>{
    navigate('/SignUpPage');
  };
  const handleResetPasswordRoute = ()=>{
    navigate('/ResetPasswordPage');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const result = await loginUser(email, password);
      if (result !==undefined) {
        navigate("/MainPage");
      } else{
        alert("Incorrect password");
      }
    } catch (error) {
      console.error("Error logging in user:", error);
    };
  };

  return (
    <div>
      <button className="backButton" onClick={() => navigate(-1)}> ⬅ </button>
      <div className="loginPageContent">
        <div >
          <form className="loginForm" onSubmit={handleLogin}>
            <p className="loginHeading">Login</p>
            <div className="loginEmail">
              <label htmlFor="email">Email</label>
              <input
                name="email"
                required="required"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter Email address..."
              />
              <span className="icon">📧</span>
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
              <span className="icon">🔒</span>
            </div>

            <div className="linkOut">
              <a className="linkToResetPassword" onClick={handleResetPasswordRoute}>Forgot Password?</a>
              <a className="linkToSignUp" onClick={handleSignUpRoute}>
                Sign Up
              </a>
            </div>
              <button className="sendLoginButton" type="submit" onClick={handleLogin}>
                Login
              </button>
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
};

export default LoginPage;
