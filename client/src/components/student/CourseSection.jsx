import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";

const CourseSection = () => {
  const {
    allCourses,
    coursesLoading,
  } = useContext(AppContext);

  const courses = allCourses?.slice(0, 4) || [];

  return (
    <section className="relative w-full overflow-hidden bg-white py-14 md:py-16">

      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-100/50 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-orange-50 blur-3xl pointer-events-none" />

      <div className="absolute top-24 left-[10%] w-2 h-2 bg-orange-400 rounded-full opacity-50" />

      <div className="absolute top-40 right-[15%] w-3 h-3 bg-orange-300 rounded-full opacity-40" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
        >

          <div className="max-w-2xl">

            {/* Badge */}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">

              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              </span>

              <span className="text-xs sm:text-sm font-semibold text-orange-600">
                Featured Courses
              </span>

            </div>

            {/* Heading */}

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">

              Discover your next

              <span className="block text-orange-600">
                learning opportunity.
              </span>

            </h2>

            {/* Description */}

            <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed max-w-xl">
              Explore courses carefully designed to help you build
              practical skills, learn from experienced educators, and
              achieve your goals one step at a time.
            </p>

          </div>


          {/* =====================================================
              DESKTOP VIEW ALL
          ====================================================== */}

          <Link
            to="/course-list"
            onClick={() => window.scrollTo(0, 0)}
            className="hidden lg:inline-flex items-center gap-3 group px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm shadow-sm hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300"
          >

            <span>
              Explore all courses
            </span>

            <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>

          </Link>

        </div>


        {/* =====================================================
            COURSE CONTENT
        ====================================================== */}

        {coursesLoading ? (

          /* ===================================================
              LOADING SKELETON
          ==================================================== */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm animate-pulse"
              >

                {/* Image */}

                <div className="h-48 bg-gray-200" />

                {/* Content */}

                <div className="p-5 space-y-4">

                  <div className="h-4 bg-gray-200 rounded w-3/4" />

                  <div className="h-3 bg-gray-200 rounded w-full" />

                  <div className="h-3 bg-gray-200 rounded w-2/3" />

                  <div className="h-10 bg-gray-200 rounded-xl mt-5" />

                </div>

              </div>

            ))}

          </div>

        ) : courses.length > 0 ? (

          /* ===================================================
              COURSES
          ==================================================== */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

            {courses.map((course, index) => (

              <div
                  key={course._id}
                  className="group"
                >

                <CourseCard
                  course={course}
                  index={index}
                />

              </div>

            ))}

          </div>

        ) : (

          /* ===================================================
              EMPTY STATE
          ==================================================== */

         <div
            className="mt-10 rounded-3xl border border-gray-100 bg-gray-50 py-16 px-6 text-center"
          >

            <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-orange-100 shadow-sm">

              <span className="text-3xl">
                📚
              </span>

            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-800">
              Courses are coming soon
            </h3>

            <p className="mt-2 max-w-md mx-auto text-sm text-gray-500">
              We're preparing exciting learning opportunities for you.
              Check back soon to start your learning journey.
            </p>

            <Link
              to="/course-list"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-all duration-300"
            >

              Browse Courses

              <span>
                →
              </span>

            </Link>

          </div>

        )}


        {/* =====================================================
            MOBILE VIEW ALL
        ====================================================== */}

        {!coursesLoading && courses.length > 0 && (

          <div className="flex justify-center mt-8 lg:hidden">

            <Link
              to="/course-list"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 font-semibold text-sm hover:bg-orange-100 transition-all duration-300"
            >

              Explore all courses

              <span>
                →
              </span>

            </Link>

          </div>

        )}


        {/* =====================================================
            TRUST / VALUE STRIP
        ====================================================== */}

        {!coursesLoading && courses.length > 0 && (

          <div
            className="mt-10 pt-6 border-t border-gray-100"
          >

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

              {/* Item 1 */}

              <div className="flex items-center gap-4">

                <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-green-50 border border-green-100">

                  <span className="text-lg text-green-600">
                    ✓
                  </span>

                </div>

                <div>

                  <h4 className="text-sm font-bold text-gray-800">
                    Practical Learning
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    Learn skills you can actually use
                  </p>

                </div>

              </div>


              {/* Item 2 */}

              <div className="flex items-center gap-4">

                <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-orange-50 border border-orange-100">

                  <span className="text-lg">
                    ⚡
                  </span>

                </div>

                <div>

                  <h4 className="text-sm font-bold text-gray-800">
                    Learn at Your Pace
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    Study whenever and wherever you want
                  </p>

                </div>

              </div>


              {/* Item 3 */}

              <div className="flex items-center gap-4">

                <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 border border-blue-100">

                  <span className="text-lg">
                    🎓
                  </span>

                </div>

                <div>

                  <h4 className="text-sm font-bold text-gray-800">
                    Earn Certificates
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    Showcase your learning achievements
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </section>
  );
};

export default CourseSection;