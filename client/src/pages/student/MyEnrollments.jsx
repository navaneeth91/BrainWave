import React from 'react'
import { createContext, useState,useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import{Line } from 'rc-progress'
import Footer from '../../components/student/Footer';
const MyEnrollments = () => {

  const [progressArray, setProgressArray] = useState([
    {lectureCompleted: 4, totalLectures: 10},
    {lectureCompleted: 2, totalLectures: 8},
    {lectureCompleted: 6, totalLectures: 12}, 
    {lectureCompleted: 3, totalLectures: 10},
    {lectureCompleted: 10, totalLectures: 10},
    {lectureCompleted: 1, totalLectures: 5},
    {lectureCompleted: 7, totalLectures: 14},
    {lectureCompleted: 8, totalLectures: 16},
    {lectureCompleted: 2, totalLectures: 6},
    {lectureCompleted: 4, totalLectures: 10},
    {lectureCompleted: 3, totalLectures: 9},
    {lectureCompleted: 5, totalLectures: 10},
    {lectureCompleted: 6, totalLectures: 12},
    {lectureCompleted: 2, totalLectures: 8}
  ]);
  const { enrolledCourses, calculateCourseDuration, calculateNoofLectures ,navigate} = useContext(AppContext);
  return (
  <>

    <div className='md:px-36 px-8 pt-10' >
      <h1 className='text-2xl font-semibold'>MyEnrollments </h1>
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
                <img src={course.courseThumbnail} alt={course.courseName} className='w-14 sm:w-24 md:w-28 object-cover rounded' />
                <div>
                  <span className='mb-1 max-sm:text-sm'>{course.courseTitle}</span>
                  <Line percent={progressArray[index] ? (progressArray[index].lectureCompleted / progressArray[index].totalLectures) * 100 : 0} strokeWidth="2" strokeColor="#d67d08ff" className='bg-gray-300 rounded-full' />
                </div>
                
              </td >
              <td className='px-4 py-3 max-sm:hidden'>{calculateCourseDuration(course)}</td>
              <td className='px-4 py-3 max-sm:hidden'>{progressArray[index]&& `${progressArray[index].lectureCompleted}/${progressArray[index].totalLectures}`} Lectures</td>
              <td className='px-4 py-3 max-sm:text-right'> <button className='px-3 sm:px-5 py-1.5 sm:py-2 bg-orange-600 maxx-sm:text-xs text-white' onClick={()=>navigate('/player/'+course._id)}>{progressArray[index]&& progressArray[index].lectureCompleted/progressArray[index].totalLectures===1?'Completed':'On Going'}</button> </td>
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
