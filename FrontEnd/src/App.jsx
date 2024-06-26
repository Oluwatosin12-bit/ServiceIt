import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import LoginPage from './UserAuthentication/LoginPage'
import SignUpPage from './UserAuthentication/SignUpPage'
import LandingPage from './UserAuthentication/LandingPage'

function App() {
  return (
    <>
      <Router>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/SignUpPage" element={<SignUpPage />} />
        </Routes>
      </Router>
    </>
  )
};

export default App
