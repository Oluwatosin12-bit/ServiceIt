import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { recoverPassword } from "./Auth";
import "./EntryPage.css";

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
      throw new Error(`Error recovering password: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="loginPageContent">
      <h3>Reset Password</h3>
      <label>
          <span>Email Address</span>
          <input
            type="email"
            name="email"
            required="required"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button className="submit login-button"  type="button" onClick={handleResetPassword}> Reset Password </button>
        <div>
          <form className="loginForm" onSubmit={handleResetPassword}>
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
      </div>
    </div>
  );
}

export default ResetPasswordPage;
