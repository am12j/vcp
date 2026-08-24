import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isTeacher = !!localStorage.getItem("ttoken") || !!localStorage.getItem("teachertoken");

  const handleLogout = () => {
    localStorage.removeItem("stoken");
    localStorage.removeItem("ttoken");
    localStorage.removeItem("teachertoken");
    localStorage.removeItem("studenttoken");
    navigate("/login", { replace: true });
  };

  return (
    <div className="top-navbar">
      <div className="navbar-brand">VCP</div>
      <div className="navbar-user">
        <span>Welcome, <strong>{isTeacher ? "Teacher" : "Student"}</strong></span>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
