import React from 'react'
import { Routes,Route, useMatch } from 'react-router-dom'
import Home from './pages/student/Home'
import CourseList from './pages/student/CourseList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollments from './pages/student/MyEnrollments'
import MyCertificates from './pages/student/MyCertificates'
import Player from './pages/student/Player'
import Loading from './components/student/Loading'
import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourse from './pages/educator/MyCourse'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import Navbar from './components/student/Navbar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import About from './components/student/about'
import PrivacyPolicy from './components/student/PrivacyPolicy'
import ContactUs from './components/student/Contactus'
import Certificate from "./pages/student/Certificate";
import VerifyCertificate from "./pages/student/VerifyCertificate";
import Exam from './pages/student/Exam';
import ExamResult from "./pages/student/ExamResult";
import ManageExam from './pages/educator/ManageExam';
const App = () => {
  const  isEducatorRoute=useMatch('/educator/*');
  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer/>
      {!isEducatorRoute &&<Navbar/>}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
         <Route path="/contact" element={<ContactUs />} /> 
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route
  path="/certificate/:certificateId"
  element={<Certificate />}
/>
<Route
  path="/educator/course/:courseId/exam"
  element={<ManageExam />}
/>

<Route
  path="/certificate/course/:courseId"
  element={<Certificate />}
/>
<Route
  path="/verify-certificate/:certificateId"
  element={<VerifyCertificate />}
/>
<Route
  path="/student/exam/:examId"
  element={<Exam />}
/>
<Route
  path="/student/exam-result/:attemptId"
  element={<ExamResult />}
/>
        <Route path="/course-list/:input" element={<CourseList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/my-certificates" element={<MyCertificates />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading/> }/>
        <Route path="/educator" element={<Educator />}>
          <Route path='/educator' element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-course" element={<MyCourse />} /> 
          <Route path="students-enrolled" element={<StudentsEnrolled/>} />


        </Route>

      </Routes>
    </div>
  )
}

export default App
