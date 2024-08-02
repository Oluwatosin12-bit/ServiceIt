import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import { useRef } from "react";
import { useTheme } from "../UseContext";
import "./EntryPage.css";

function EntryPage() {
  const { theme } = useTheme();
  const imgBtnRef = useRef(null);
  const contRef = useRef(null);
  function handleClick() {
    contRef.current.classList.toggle("s-signup");
  }
  return (
    <div className={`entryPage ${theme}`}>
      <div className={`cont `} ref={contRef}>
        <LoginPage />
        <div className="sub-cont">
          <div className="img">
            <div className="img-text m-up">
              <h1>New here?</h1>
              <p>sign up and discover</p>
            </div>
            <div className="img-text m-in">
              <h1>One of us?</h1>
              <p>Just sign in</p>
            </div>
            <div>
              <img
                className="signUpImage"
                src="/coworking-woman-doing-online-shopping-at-home.gif"
              />
            </div>
            <div className="img-btn" ref={imgBtnRef} onClick={handleClick}>
              <span className="m-up">Sign Up</span>
              <span className="m-in">Login</span>
            </div>
          </div>
          <SignUpPage />
        </div>
      </div>
    </div>
  );
}
export default EntryPage;
