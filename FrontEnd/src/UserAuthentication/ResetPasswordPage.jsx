import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { recoverPassword } from "./Auth";
import "./LoginPage.css";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleResetPassword = async (event) => {
    event.preventDefault();
    try {
      const result = await recoverPassword(email);
      if (result !== null) {
        navigate("/MainPage");
      }
    } catch (error) {
      throw new Error("Error recovering password:");
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
          <form className="loginForm" onSubmit={handleResetPassword}>
            <h3>Reset Password</h3>
            <div className="loginEmail">
              <label htmlFor="email">Email</label>
              <input
                name="email"
                required="required"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter Email address..."
              />
            </div>
            <div>
              <button className="sendLoginButton" type="submit">
                Reset
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

export default ResetPasswordPage;
