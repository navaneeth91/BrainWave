import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from './CourseCard'
import AdBanner from "../components/AdBanner";

const CourseSection = () => {
  const {allCourses}=useContext(AppContext)
  return (
    <div className='py-16 md:px-40 px-8'>
      <h2 className='text-3xl font-medium text-gray-800'>Learn from the best</h2>
      <p className='text-sm md:text-base text-gray-500 mt-3'>
        Check out our highly-rated lessons in a wide range of subjects. From tech and art to leadership and lifestyle, each course is designed to help you grow and succeed.
      </p>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10'>
        {allCourses.slice(0,4).map((course,index)=><CourseCard key={index} course={course}/>)}
      </div>
      <Link 
        to="/course-list" 
        onClick={() => window.scrollTo(0, 0)} 
        className="mt-6 inline-block text-gray-500 border border-gray-500/30 px-10 py-3 rounded hover:bg-gray-100 transition"
      >
        Show all Courses
      </Link>
       <AdBanner />
    </div>
  )
}

export default CourseSection
