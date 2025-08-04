import React from 'react'
import { createContext, useState,useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';

const MyEnrollments = () => {

  const [progressArray, setProgressArray] = useState([]);
  const { enrolledCourses, calculateCourseDuration, calculateNoofLectures } = useContext(AppContext);
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
                </div>
                
              </td >
              <td className='px-4 py-3 max-sm:hidden'>{calculateCourseDuration(course)}</td>
              <td className='px-4 py-3 max-sm:hidden'>{4/10} Lectures</td>
              <td className='px-4 py-3 max-sm:text-right'> <button className='px-3 sm:px-5 py-1.5 sm:py-2 bg-orange-600 maxx-sm:text-xs text-white'>On Going</button> </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
  )
}

export default MyEnrollments
