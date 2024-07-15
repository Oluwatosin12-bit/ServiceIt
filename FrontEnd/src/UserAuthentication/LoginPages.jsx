import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "./Auth";
import "./SignUpPage.css"

function LoginPages() {
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
    <div className="form sign-in">
      <div className="login-content">
        <h2>Login</h2>
        <label>
          <span>Email Address</span>
          <input
            type="email"
            name="email"
            required="required"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="password-input">
          <span>Password</span>
          <div className="input-container">
            <input
              name="password"
              required="required"
              type={isPasswordVisible ? "text" : "password"}
              onChange={(event) => setPassword(event.target.value)}
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
        </label>
        <div className="linkOut">
          <a href="/ResetPasswordPage">Forgot Password?</a>
        </div>
        <button
          className="submit login-button"
          type="button"
          onClick={handleLogin}
        >
          Login
        </button>
        {errorMessage && <p className="errorMessage">Incorrect Password</p>}

        <div className="social-media">
          <ul>
            <li>
              <i className="fa-brands fa-instagram"></i>
            </li>
            <li>
              <i className="fa-brands fa-twitter"></i>
            </li>
            <li>
              <i className="fa-brands fa-linkedin"></i>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginPages;
