import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import SearchBar from '../../components/student/SearchBar';
import { useParams } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import { assets } from '../../assets/assets';
import Footer from '../../components/student/Footer';
import AOS from "aos";
import "aos/dist/aos.css";

const CourseList = () => {
  const { input } = useParams();
  const { navigate, allCourses } = useContext(AppContext);
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: false,
    });
  }, []);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const temp = allCourses.slice();
      input
        ? setFilteredCourses(
            temp.filter((course) =>
              course.courseTitle.toLowerCase().includes(input.toLowerCase())
            )
          )
        : setFilteredCourses(temp);
    }
  }, [allCourses, input]);

  return (
    <>
    <div className="relative md:px-36 px-8 pt-20 text-left space-y-6 bg-gradient-to-b from-orange-200/70  ">
      {/* Heading Section */}
      <div data-aos="fade-down">
        <h1 className="text-4xl font-semibold text-gray-800">Course List</h1>
        <p className="text-gray-500">
          <span
            onClick={() => navigate("/")}
            className="text-blue-600 cursor-pointer"
          >
            Home
          </span>{" "}
          / <span>CourseList</span>
        </p>
      </div>

      {/* Filter Chip */}
      {input && (
        <div
          data-aos="zoom-in"
          className="inline-flex items-center gap-4 px-4 py-2 border mt-8 mb-8 text-gray-600"
        >
          <p>{input}</p>
          <img
            src={assets.cross_icon}
            alt="cross_icon"
            className="cursor-pointer"
            onClick={() => navigate("/course-list")}
          />
        </div>
      )}

      {/* Search Bar */}
      <div data-aos="fade-up">
        <SearchBar data={input} />
      </div>

      {/* Course Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        data-aos="fade-up"
      >
        {allCourses.length === 0 ? (
          <p className="text-gray-500 col-span-full">
            No courses available at the moment.
          </p>
        ) : (
          filteredCourses.map((course, index) => (
            <CourseCard key={index} course={course} index={index} />
          ))
        )}
      </div>
     

      
    </div>
        
    <Footer />
    </>
  );
};

export default CourseList;
