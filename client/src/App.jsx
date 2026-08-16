import React, { useContext } from "react";
import { Navigate, Route, Routes, useMatch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/student/Navbar";
import About from "./components/student/about";
import ContactUs from "./components/student/Contactus";
import PrivacyPolicy from "./components/student/PrivacyPolicy";
import Loading from "./components/student/Loading";
import Home from "./pages/student/Home";
import CourseList from "./pages/student/CourseList";
import CourseDetails from "./pages/student/CourseDetails";
import MyEnrollments from "./pages/student/MyEnrollments";
import MyCertificates from "./pages/student/MyCertificates";
import Player from "./pages/student/Player";
import Certificate from "./pages/student/Certificate";
import VerifyCertificate from "./pages/student/VerifyCertificate";
import Exam from "./pages/student/Exam";
import ExamResult from "./pages/student/ExamResult";
import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourse from "./pages/educator/MyCourse";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import ManageExam from "./pages/educator/ManageExam";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import PhoneLogin from "./pages/auth/PhoneLogin";
import { AppContext } from "./context/AppContext";

const RequireAuth = ({ children }) => {
  const { isAuthenticated, authLoading } = useContext(AppContext);
  if (authLoading) return <Loading />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RequireEducator = ({ children }) => {
  const { isAuthenticated, isEducator, authLoading } = useContext(AppContext);
  if (authLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isEducator) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const isEducatorRoute = useMatch("/educator/*");
  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />
      {!isEducatorRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/course-list/:input" element={<CourseList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />
        <Route path="/loading/:path" element={<Loading />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/phone-login" element={<PhoneLogin />} />

        <Route path="/my-enrollments" element={<RequireAuth><MyEnrollments /></RequireAuth>} />
        <Route path="/my-certificates" element={<RequireAuth><MyCertificates /></RequireAuth>} />
        <Route path="/player/:courseId" element={<RequireAuth><Player /></RequireAuth>} />
        <Route path="/certificate/:certificateId" element={<RequireAuth><Certificate /></RequireAuth>} />
        <Route path="/certificate/course/:courseId" element={<RequireAuth><Certificate /></RequireAuth>} />
        <Route path="/student/exam/:examId" element={<RequireAuth><Exam /></RequireAuth>} />
        <Route path="/student/exam-result/:attemptId" element={<RequireAuth><ExamResult /></RequireAuth>} />

        <Route path="/educator" element={<RequireEducator><Educator /></RequireEducator>}>
          <Route path="/educator" element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-course" element={<MyCourse />} />
          <Route path="students-enrolled" element={<StudentsEnrolled />} />
          <Route path="course/:courseId/exam" element={<ManageExam />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
