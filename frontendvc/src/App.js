import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing.jsx";
import Login from "./login.jsx";
import Signup from "./signup.jsx";
import StudentDashboard from "./studentdas.jsx";
import TeacherDashboard from "./teacherdas.jsx";
import TeacherQueryPage from "./TeacherQueryPage.jsx";
import StudentQueryPage from "./StudentQueryPage.jsx";
import Navbar from "./Navbar.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="main-wrapper">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/studentdas"
            element={
              localStorage.getItem("stoken") ? (
                <>
                  <Navbar />
                  <StudentDashboard />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/teacherdas"
            element={
              localStorage.getItem("ttoken") ? (
                <>
                  <Navbar />
                  <TeacherDashboard />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route 
            path="/teacherQuery" 
            element={
              localStorage.getItem("teachertoken") ? (
                <>
                  <Navbar />
                  <TeacherQueryPage/>
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route 
            path="/student-query" 
            element={
              localStorage.getItem("studenttoken") ? (
                <>
                  <Navbar />
                  <StudentQueryPage/>
                </>
              ) : (
                <Navigate to="/login"/>
              )
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;