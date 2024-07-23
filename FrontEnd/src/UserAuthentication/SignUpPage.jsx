import { useNavigate} from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { registerUser } from "./Auth";
import { CATEGORIES } from "../Categories";
import { useTheme } from "../UseContext";
import "./EntryPage.css";

function SignUpPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories] = useState(CATEGORIES);
  const MIN_PASSWORD_LENGTH = 6;

  const removeCategory = (category) => {
    setSelectedCategories(selectedCategories.filter((selectedCategory) => selectedCategory !== category));
  };
  const handleCategoryChange = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    const newCategories = selectedOptions.filter(
      (category) => !selectedCategories.includes(category)
    );
    setSelectedCategories([...selectedCategories, ...newCategories]);
  };

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
      setErrorMessage(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      );
      return;
    }
    try {
      const userCredential = await registerUser(
        email,
        password,
        userName,
        name,
        selectedCategories,
        userLocation
      );
      if (userCredential !== null) {
        navigate("/UserProfile");
      } else {
        setErrorMessage("Username taken. Please choose a different one");
      }
    } catch (error) {
      setErrorMessage("Invalid Input");
    }
  };

  return (
    <div className="form sign-up">
      <h2>Sign Up</h2>
      <label>
        <span>Name</span>
        <input
          name="name"
          id="name"
          placeholder="Jane Doe"
          onChange={(event) => setName(event.target.value)}
          required="required"
        />
      </label>
      <label>
        <span>Email</span>
        <input
          type="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required="required"
        />
      </label>
      <label>
        <span>Username</span>
        <input
          name="username"
          onChange={(event) => setUserName(event.target.value)}
          required="required"
        />
      </label>
      <label className="password-input">
        <span>Password</span>
        <div className="input-container">
        <input
          name="password"
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
      <div className="selectedCategories">
        {selectedCategories.map((category, index) => (
          <div className="categoryTag" key={index}>
            {category}
            <span
              className="cancelIcon"
              onClick={() => removeCategory(category)}
            >
              ×
            </span>
          </div>
        ))}
      </div>

      <div className="availableCategories">
        <label htmlFor="categoryDropdown">Select Categories:</label>
        <select id="categoryDropdown" onChange={handleCategoryChange}>
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <label>
        <span>Location</span>
        <input
          name="location"
          onChange={(event) => setUserLocation(event.target.value)}
          required="required"
          placeholder="City, State"
        />
      </label>
      <button
        type="button"
        className="submit sendSignUpButton"
        onClick={handleSignUp}
        disabled={!isFormValid}
      >
        Sign Up Now
      </button>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
    </div>
  );
}

export default SignUpPage;
