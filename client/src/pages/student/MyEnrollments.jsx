import React from 'react'
import { createContext, useState,useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import{Line } from 'rc-progress'
import Footer from '../../components/student/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyEnrollments = () => {

          
  const { enrolledCourses, calculateCourseDuration, calculateNoofLectures ,navigate,userData,backendUrl,fetchEnrolledCourses,getToken} = useContext(AppContext);
  const [progressArray, setProgressArray] = useState([]);
const getCourseProgress = async () => {
  try {
    const token = await getToken();

    const tempProgressArray = await Promise.all(
      enrolledCourses.map(async (course) => {

        const { data } = await axios.get(
          `${backendUrl}/api/user/course-progress/${course._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const totalLectures = calculateNoofLectures(course);

        const completedLectures = Array.isArray(
          data?.progressData?.lectureCompleted
        )
          ? data.progressData.lectureCompleted.length
          : 0;

        return {
          completedLectures,
          totalLectures
        };
      })
    );

    setProgressArray(tempProgressArray);

  } catch (error) {
    toast.error(error.message);
    console.error(
      "Error fetching course progress:",
      error
    );
  }
};
  useEffect(() => {
    if (userData) {
      fetchEnrolledCourses();
    }
  }, [userData]);
   useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);
  return (
  <>

    <div className='md:px-36 px-8 pt-10' >
      <h1 className='text-2xl font-semibold'>MyEnrollments </h1>
      <button
        onClick={() => navigate("/my-certificates")}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm sm:text-base"
      >
        <span>🎓</span>
        <span className="hidden sm:inline">My Certificates</span>
        <span className="sm:hidden">Certificates</span>
      </button>
      <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
        <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
          <tr className=''>
            <th className='px-4 py-3 font-semibold truncate'>Course</th>
            <th className='px-4 py-3 font-semibold truncate'>Duration</th>
            <th className='px-4 py-3 font-semibold truncate'>Completed</th>
            <th className='px-4 py-3 font-semibold truncate'>Status</th>
          </tr>
        </thead>
        <tbody className='text-gray-700 '>
          {enrolledCourses.map((course,index) => (
            <tr key={index} className='border-b border-gray-500/20'>
              <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-2 '>
                <img src={course.courseThumbnail} alt={course.courseTitle} className='w-14 sm:w-24 md:w-28 object-cover rounded' />
                <div>
                  <span className='mb-1 max-sm:text-sm'>{course.courseTitle}</span>
                  <Line percent={progressArray[index] ? (progressArray[index].completedLectures / progressArray[index].totalLectures) * 100 : 0} strokeWidth="2" strokeColor="#d67d08ff" className='bg-gray-300 rounded-full' />
                </div>
                
              </td >
              <td className='px-4 py-3 max-sm:hidden'>{calculateCourseDuration(course)}</td>
              <td className='px-4 py-3 max-sm:hidden'>{progressArray[index]&& `${progressArray[index].completedLectures}/${progressArray[index].totalLectures}`} Lectures</td>
              <td className='px-4 py-3 max-sm:text-right'>
  {progressArray[index] &&
   progressArray[index].completedLectures ===
   progressArray[index].totalLectures &&
   progressArray[index].totalLectures > 0 ? (

    <button
      className='px-3 sm:px-5 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded'
      onClick={() => navigate(`/certificate/course/${course._id}`)}
    >
      View Certificate
    </button>

  ) : (

    <button
      className='px-3 sm:px-5 py-1.5 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white rounded'
      onClick={() => navigate('/player/' + course._id)}
    >
      On Going
    </button>

  )}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <Footer/>
  </>
  )
}

export default MyEnrollments
