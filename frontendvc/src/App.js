import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./login.jsx";
import Signup from "./signup.jsx";
import StudentDashboard from "./studentdas.jsx";
import TeacherDashboard from "./teacherdas.jsx";
import TeacherQueryPage from "./TeacherQueryPage.jsx";
import StudentQueryPage from "./StudentQueryPage.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="main-wrapper">
        <h1 className="heading-main">Welcome to Our App</h1>
        <p className="description-text">
          Please login or signup to access the full features of the application.
        </p>

        <div className="nav-container">
          <Link to="/login" className="nav-link">Login</Link>
          <span className="divider">|</span>
          <Link to="/signup" className="nav-link">Signup</Link>
        </div>

        <Routes>
    
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          
          <Route
            path="/studentdas"
            element={localStorage.getItem("stoken") ? <StudentDashboard /> : <Navigate to="/login" />}
          />

          
          <Route
            path="/teacherdas"
            element={localStorage.getItem("ttoken") ? <TeacherDashboard /> : <Navigate to="/login" />}
          />

        
          <Route path="/teacherQuery" element={localStorage.getItem("teachertoken") ?<TeacherQueryPage/> : <Navigate to="/login" />}/>
          <Route path="/student-query" element={localStorage.getItem("studenttoken")?<StudentQueryPage/> : <Navigate to="/login"/>}/>

          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;