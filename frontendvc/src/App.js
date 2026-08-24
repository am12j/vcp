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
              <>
                <Navbar />
                <StudentDashboard />
              </>
            }
          />

          <Route
            path="/teacherdas"
            element={
              <>
                <Navbar />
                <TeacherDashboard />
              </>
            }
          />

          <Route 
            path="/teacherQuery" 
            element={
              <>
                <Navbar />
                <TeacherQueryPage />
              </>
            }
          />

          <Route 
            path="/student-query" 
            element={
              <>
                <Navbar />
                <StudentQueryPage />
              </>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
