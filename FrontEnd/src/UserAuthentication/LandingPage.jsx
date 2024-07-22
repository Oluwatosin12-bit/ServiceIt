import React, { useRef, useState } from "react";
import { useTheme } from "../UseContext";
import "./LandingPage.css";

function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const landingPageContentRef = useRef(null);

  const handleThemeChange = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.classList.toggle("stopScrolling");
  };

  return (
    <main className="stopScrolling">
      <div
        ref={landingPageContentRef}
        className={`landingPageContent ${theme} ${isMenuOpen ? "active" : ""}`}
      >
        <img src="/shape.png" alt="shape" className="shape" />
        <header>
          <div className="container">
            <div className="logo">
              <img src="/logo.png" alt="logo" />
              <h3>ServiceIt</h3>
            </div>

            <div className="toggleThemeArea">
              <button className="toggleBtn" onClick={handleThemeChange}>
                <i
                  className={`far ${theme === "light" ? "fa-moon" : "fa-sun"}`}
                ></i>
              </button>
            </div>

            <div className="links">
              <ul className={isMenuOpen ? "active" : ""}>
                <li>
                  <a href="#">About Us</a>
                </li>
              </ul>
            </div>

            <div
              className={`overlay ${isMenuOpen ? "active" : ""}`}
              onClick={handleMenuToggle}
            ></div>

            <div className="hamburgerMenu" onClick={handleMenuToggle}>
              <div className="bar"></div>
            </div>
          </div>
        </header>

        <div className="showcaseArea">
          <div className="container">
            <div className="left">
              <div className="bigTitle">
                <h1>Quality Services, One Click Away,</h1>
              </div>
              <p className="text">
                Our app seamlessly connects customers with a diverse range of
                skilled service providers, making it easy to discover and book
                the perfect professional for any task
              </p>
              <div className="cta">
                <a href="/EntryPage" className="btn">
                  Get started
                </a>
              </div>
            </div>
            <div className="right">
              <img src="/person.png" alt="Person Image" className="person" />
            </div>
          </div>
        </div>

        <div className="bottomArea">
          <div className="container"></div>
        </div>
      </div>
    </main>
  );
}

export default LandingPage;
