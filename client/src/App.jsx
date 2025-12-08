import React, { useEffect } from 'react'
import { Routes,Route, useMatch } from 'react-router-dom'
import Home from './pages/student/Home'
import CourseList from './pages/student/CourseList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollments from './pages/student/MyEnrollments'
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
import AOS from 'aos';
import 'aos/dist/aos.css';
const App = () => {
  const  isEducatorRoute=useMatch('/educator/*');
   useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 50,
      once: true,
      easing: 'ease-out',
    });
  }, []);
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
        <Route path="/course-list/:input" element={<CourseList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
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
