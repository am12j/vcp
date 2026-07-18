import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  const handleLogout = () => {
    localStorage.removeItem("stoken");
    localStorage.removeItem("ttoken");
    localStorage.removeItem("studenttoken");
    localStorage.removeItem("teachertoken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="top-navbar">
      <div className="navbar-brand">VCP</div>
      <div className="navbar-user">
        {user && <span>Welcome, <strong>{user}</strong></span>}
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
