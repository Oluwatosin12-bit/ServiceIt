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
    <div className="alternate-signup">
      <div>
        <form>
        <h3 className="resetTitle">Reset Password</h3>
        <label>
          <span>Email Address</span>
          <input
            type="email"
            name="email"
            required="required"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button
          className="submit reset-submit"
          type="submit"
          onClick={handleResetPassword}
        >
          {" "}
          Reset Password{" "}
        </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
