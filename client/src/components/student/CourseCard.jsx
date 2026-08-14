import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'

const CourseCard = ({ course, index = 0 }) => {
  const { currency, calculateRating, freeCoursesMode } = useContext(AppContext)
  const rating = calculateRating(course)

  const discountedPrice = (
    course.coursePrice - (course.discount * course.coursePrice) / 100
  ).toFixed(2)
  const displayPrice = freeCoursesMode ? 'Free' : `${currency}${discountedPrice}`
  const originalPrice = `${currency}${course.coursePrice.toFixed(2)}`

  return (
<Link
  to={`/course/${course._id}`}
  onClick={() => scrollTo(0, 0)}
  className="border border-gray-300 pb-6 overflow-hidden rounded-lg transition duration-300 transform hover:scale-105 hover:shadow-lg bg-gray-50"
  data-aos="zoom-in"
  data-aos-duration="800"
  data-aos-delay={`${index * 100}`}
>
  {/* Thumbnail */}
  <img
    src={course.courseThumbnail}
    alt={course.courseTitle || "Course thumbnail"}
    className="w-full h-40 object-cover"
  />

  <div className="p-3 text-left">
    {/* Title */}
    <h3 className="text-base font-semibold text-gray-800">{course.courseTitle}</h3>

    {/* Educator */}
    <p className="text-gray-700">{course.educator?.name || "Unknown Instructor"}</p>

    {/* Rating */}
    <div className="flex items-center space-x-2 mt-1">
      <p>{rating}</p>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <img
            key={i}
            src={i < Math.floor(rating) ? assets.star : assets.star_blank}
            alt=""
            className="w-3.5 h-3.5"
          />
        ))}
      </div>
      <p className="text-gray-800">{course.courseRatings.length}</p>
    </div>

    {/* Price */}
    <p className="text-base font-semibold text-gray-600 mt-2">
      {!freeCoursesMode && course.discount > 0 && (
        <span className="line-through text-gray-400 mr-2">
          {originalPrice}
        </span>
      )}
      {displayPrice}
    </p>
  </div>
</Link>

  )
}

export default CourseCard
