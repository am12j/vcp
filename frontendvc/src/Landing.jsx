import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="landing-container">
      <h1 className="heading-main">Welcome to VCP</h1>
      <p className="description-text">
        The complete Virtual Classroom Platform. Please login or signup to access the full features of the application.
      </p>

      <div className="nav-container">
        <Link to="/login" className="nav-link">Login</Link>
        <span className="divider">|</span>
        <Link to="/signup" className="nav-link">Signup</Link>
      </div>
    </div>
  );
};

export default Landing;
