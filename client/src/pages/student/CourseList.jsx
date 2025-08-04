import React, { useContext, useState,useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import SearchBar from '../../components/student/SearchBar';
import { useParams } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import { set } from 'mongoose';
import { assets } from '../../assets/assets';
import Footer from '../../components/student/Footer';

const CourseList = () => {
  const { input } = useParams();
  const { navigate, allCourses } = useContext(AppContext);
  const [filteredCourses, setFilteredCourses] = useState([]);
  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
        const temp=allCourses.slice()
        input? setFilteredCourses(temp.filter(course => course.courseTitle.toLowerCase().includes(input.toLowerCase()))) :setFilteredCourses(temp)}
  },[allCourses, input])

  return (
    <div className='relative md:px-36 px-8 pt-20 text-left space-y-6'>
      {/* Heading Section */}
      <div>
        <h1 className='text-4xl font-semibold text-gray-800'>Course List</h1>
        <p className='text-gray-500'>
          <span onClick={() => navigate('/')} className='text-blue-600 cursor-pointer'>
            Home
          </span>{' '}
          / <span>CourseList</span>
        </p>
      </div>
      {
        input && <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8 mb-8 text-gray-600'>
          <p>{input}</p>
          <img src={assets.cross_icon} alt='' className='cursor-pointer ' onClick={() => navigate('/course-list')} />
        </div>
      }
      {/* Search Bar */}
      <SearchBar data={input} />

      {/* Course Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {allCourses.length === 0 ? (
          <p className='text-gray-500 col-span-full'>No courses available at the moment.</p>
        ) : (
          filteredCourses.map((course, index) => <CourseCard key={index} course={course} />)
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default CourseList;
