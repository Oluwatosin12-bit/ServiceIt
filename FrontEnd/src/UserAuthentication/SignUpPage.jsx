import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { registerUser } from "./Auth";
import "./SignUpPage.css";

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const MIN_PASSWORD_LENGTH = 8;

  const validateForm = () => {
    return (
      email.trim() !== "" && password.trim() !== "" && userName.trim() !== ""
    );
  };
  useEffect(() => {
    setIsFormValid(validateForm());
  }, [email, password, userName]);

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage("Password must be at least 8 characters");
    }
    try {
      const userCredential = await registerUser(
        email,
        password,
        userName,
        firstName,
        lastName
      );
      if (userCredential !== null) {
        navigate("/UserProfile");
      } else {
        setErrorMessage("Username taken");
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
      <div className="signUpPageContent">
        <div>
          <form className="signUpForm">
            <h3>Create an account</h3>
            <div className="signUpFirstName">
              <label htmlFor="firstName">First name</label>
              <input
                name="firstName"
                id="firstName"
                onChange={(event) => setFirstName(event.target.value)}
                required="required"
                placeholder="Enter First name"
              />
            </div>
            <div className="signUpLastName">
              <label htmlFor="lastName">Last name</label>
              <input
                name="lastName"
                id="lastName"
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Enter Last name"
              />
            </div>
            <div className="signUpEmail">
              <label htmlFor="email">Email</label>
              <input
                name="email"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter Email"
                required="required"
              />
            </div>
            <div className="signUpUsername">
              <label htmlFor="username">Username</label>
              <input
                name="username"
                id="username"
                onChange={(event) => setUserName(event.target.value)}
                required="required"
                placeholder="Enter Username"
              />
            </div>
            <div className="signUpPassword">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter Password"
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
            <Link to="/LoginPage">
              <p className="linkToLogin">Already have an account?</p>
            </Link>

            <button
              className="sendSignUpButton"
              onClick={handleSignUp}
              disabled={!isFormValid}
            >
              Sign Up
            </button>
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
          </form>
        </div>
        <div>
          <img
            className="signUpImage"
            src="src/Images/coworking-woman-doing-online-shopping-at-home.gif"
          />
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
