import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  const {
    currency,
    calculateRating,
    freeCoursesMode,
  } = useContext(AppContext);

  const rating = calculateRating(course);

  const discountedPrice = (
    course.coursePrice -
    (course.discount * course.coursePrice) / 100
  ).toFixed(2);

  const displayPrice = freeCoursesMode
    ? "Free"
    : `${currency}${discountedPrice}`;

  const originalPrice = `${currency}${Number(course.coursePrice || 0).toFixed(2)}`;

  const reviewCount = course.courseRatings?.length || 0;

  return (
    <Link
      to={`/course/${course._id}`}
      onClick={() => window.scrollTo(0, 0)}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >

      {/* =====================================================
          THUMBNAIL
      ====================================================== */}

      <div className="relative overflow-hidden bg-gray-100">

        <img
          src={course.courseThumbnail}
          alt={course.courseTitle || "Course thumbnail"}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Image overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />


        {/* Discount Badge */}

        {course.discount > 0 && !freeCoursesMode && (
          <div className="absolute top-3 left-3">

            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-600 text-white text-xs font-bold shadow-md">
              {course.discount}% OFF
            </span>

          </div>
        )}


        {/* Free Badge */}

        {freeCoursesMode && (
          <div className="absolute top-3 left-3">

            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold shadow-md">
              ✓ Free
            </span>

          </div>
        )}


        {/* View Course */}

        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">

          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-orange-600 shadow-lg">
            →
          </span>

        </div>

      </div>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-4">

        {/* Course title */}

        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 min-h-[44px]">
          {course.courseTitle}
        </h3>


        {/* Educator */}

        <div className="flex items-center gap-2 mt-3">

          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-50 border border-orange-100">

            <span className="text-xs font-bold text-orange-600">
              {(course.educator?.name || "I")
                .charAt(0)
                .toUpperCase()}
            </span>

          </div>

          <p className="text-sm text-gray-500 truncate">
            {course.educator?.name || "Unknown Instructor"}
          </p>

        </div>


        {/* =====================================================
            RATING
        ====================================================== */}

        <div className="flex items-center gap-2 mt-3">

          <span className="text-sm font-bold text-gray-800">
            {Number(rating || 0).toFixed(1)}
          </span>

          <div className="flex items-center gap-[2px]">

            {[...Array(5)].map((_, i) => (

              <img
                key={i}
                src={
                  i < Math.floor(rating || 0)
                    ? assets.star
                    : assets.star_blank
                }
                alt=""
                className="w-3.5 h-3.5"
              />

            ))}

          </div>

          <span className="text-xs text-gray-400">
            ({reviewCount})
          </span>

        </div>


        {/* =====================================================
            PRICE
        ====================================================== */}

        <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">

          <div className="flex items-center gap-2">

            {!freeCoursesMode && course.discount > 0 && (

              <span className="text-xs text-gray-400 line-through">
                {originalPrice}
              </span>

            )}

            <span
              className={`text-lg font-bold ${
                freeCoursesMode
                  ? "text-green-600"
                  : "text-gray-900"
              }`}
            >
              {displayPrice}
            </span>

          </div>


          {/* Arrow */}

          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-orange-50 transition-colors duration-200">

            <span className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all duration-200">
              →
            </span>

          </div>

        </div>

      </div>

    </Link>
  );
};

export default CourseCard;