import React, { useContext } from 'react'
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, index }) => {
  const { currency, calculateRating } = useContext(AppContext);

  return (
    <Link
      to={'/course/' + course._id}
      onClick={() => scrollTo(0, 0)}
      className="border border-gray-300 pb-6 overflow-hidden rounded-lg transition duration-300 transform hover:scale-105 hover:shadow-lg bg-white"
      data-aos="zoom-in"
      data-aos-duration="800"
      data-aos-delay={`${(index ?? 0) * 100}`}
// stagger animation
    >
      <img src={course.courseThumbnail} alt={course.title} className="w-full" />
      <div className="p-3 text-left">
        <h3 className="text-base font-semibold">{course.courseTitle}</h3>
        <p className="text-lg text-gray-500">{course.educator.name}</p>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <p>{calculateRating(course)}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={
                  i < Math.floor(calculateRating(course))
                    ? assets.star
                    : assets.star_blank
                }
                alt="Star"
                className="w-3.5 h-3.5"
              />
            ))}
          </div>
          <p className="text-gray-800">{course.courseRatings.length}</p>
        </div>

        {/* Price */}
        <p className="text-base font-semibold text-gray-600 mt-2">
          {currency}
          {(
            course.coursePrice -
            (course.discount * course.coursePrice) / 100
          ).toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default CourseCard;
