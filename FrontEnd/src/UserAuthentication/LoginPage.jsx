import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "./Auth";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const result = await loginUser(email, password);
      if (result !== undefined) {
        navigate("/MainPage");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div>
      <button className="backButton" onClick={() => navigate(-1)}>
        {" "}
        ⬅{" "}
      </button>
      <div className="loginPageContent">
        <div>
          <form className="loginForm" onSubmit={handleLogin}>
            <p className="loginHeading">Login</p>
            <div className="loginEmail">
              <label htmlFor="email">Email</label>
              <input
                name="email"
                id="email"
                required="required"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter Email address..."
              />
              <span>
                <i className="fa-solid fa-envelope icon"></i>
              </span>
            </div>

            <div className="loginPassword">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                id="password"
                required="required"
                type={isPasswordVisible ? "text" : "password"}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter Password..."
              />
              <span
                className="icon"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <i className="fa-solid fa-eye"></i>
                ) : (
                  <i className="fa-solid fa-eye-slash"></i>
                )}
              </span>
            </div>

            <div className="linkOut">
              <Link to="/ResetPasswordPage">Forgot Password?</Link>
              <Link to="/SignUpPage">Sign Up</Link>
            </div>
            <button className="sendLoginButton" type="submit">
              Login
            </button>
            {errorMessage && <p className="errorMessage">Incorrect Password</p>}
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
