import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="heading-main">Welcome to VCP</h1>
        <p className="description-text">
          The complete Virtual Classroom Platform. Please login or signup to access the full features of the application.
        </p>

        <blockquote className="landing-quote">
          "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
          <span>— Malcolm X</span>
        </blockquote>

        <div className="nav-container">
          <Link to="/login" className="nav-link">Login</Link>
          <span className="divider">|</span>
          <Link to="/signup" className="nav-link">Signup</Link>
        </div>
      </div>
      
      <div className="landing-image-section">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Students studying together" 
          className="landing-image"
        />
      </div>
    </div>
  );
};

export default Landing;
