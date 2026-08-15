import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import SearchBar from "../../components/student/SearchBar";
import { useParams } from "react-router-dom";
import CourseCard from "../../components/student/CourseCard";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

const CourseList = () => {
  const { input } = useParams();
  const { navigate, allCourses } = useContext(AppContext);

  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const temp = allCourses.slice();

      if (input) {
        setFilteredCourses(
          temp.filter((course) =>
            course.courseTitle
              ?.toLowerCase()
              .includes(input.toLowerCase())
          )
        );
      } else {
        setFilteredCourses(temp);
      }
    } else {
      setFilteredCourses([]);
    }
  }, [allCourses, input]);

  const totalCourses = allCourses?.length || 0;
  const resultCount = filteredCourses.length;

  return (
    <>
      <main className="min-h-screen bg-[#fafafa] text-gray-900">

        {/* =====================================================
            HERO SECTION
        ====================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50/40">

          {/* Decorative blobs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />

          <div className="absolute top-56 -left-32 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl" />

          <div className="absolute right-[25%] top-20 w-3 h-3 bg-orange-400 rounded-full opacity-60" />
          <div className="absolute right-[20%] top-36 w-2 h-2 bg-orange-300 rounded-full opacity-70" />
          <div className="absolute left-[18%] top-32 w-2 h-2 bg-orange-400 rounded-full opacity-60" />

          <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-8 md:pt-12 pb-14 md:pb-20">

            {/* Breadcrumb */}
            <div
              className="flex items-center gap-2 text-sm mb-10"
              data-aos="fade-down"
            >
              <button
                onClick={() => navigate("/")}
                className="font-medium text-orange-600 hover:text-orange-700 transition"
              >
                Home
              </button>

              <span className="text-gray-300">/</span>

              <span className="text-gray-500">
                Courses
              </span>
            </div>

            {/* Hero content */}
            <div
              className="max-w-4xl"
              data-aos="fade-up"
            >

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                </span>

                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  Learn. Build. Grow.
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-gray-900">
                Find the right course
                <br className="hidden sm:block" />

                <span className="text-orange-600">
                  {" "}for your journey.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-2xl text-gray-600 text-base md:text-lg leading-relaxed">
                Explore practical courses designed to help you develop
                valuable skills, learn from experienced instructors, and
                move confidently toward your goals.
              </p>

            </div>

            {/* Search */}
            <div
              className="mt-9 max-w-3xl"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="bg-white rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100">

                <SearchBar data={input} />

              </div>
            </div>

            {/* Quick stats */}
            <div
              className="flex flex-wrap items-center gap-3 sm:gap-5 mt-7"
              data-aos="fade-up"
              data-aos-delay="200"
            >

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {totalCourses}
                  </span>{" "}
                  Courses
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
                <span className="text-sm">🎓</span>
                <span className="text-sm text-gray-600">
                  Learn at your own pace
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
                <span className="text-sm">🏆</span>
                <span className="text-sm text-gray-600">
                  Earn certificates
                </span>
              </div>

            </div>

            {/* Search chip */}
            {input && (
              <div
                className="mt-6 inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-orange-200 rounded-full shadow-sm"
                data-aos="zoom-in"
              >
                <span className="text-sm text-gray-500">
                  Results for
                </span>

                <span className="font-semibold text-orange-600">
                  "{input}"
                </span>

                <button
                  onClick={() => navigate("/course-list")}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 transition"
                  aria-label="Clear search"
                >
                  <img
                    src={assets.cross_icon}
                    alt="Clear"
                    className="w-3 h-3"
                  />
                </button>
              </div>
            )}

          </div>
        </section>


        {/* =====================================================
            COURSES SECTION
        ====================================================== */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-14 md:py-20">

          {/* Section heading */}
          <div
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-9"
            data-aos="fade-up"
          >

            <div>

              <div className="flex items-center gap-3 mb-2">

                <span className="w-8 h-[3px] bg-orange-500 rounded-full" />

                <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
                  Explore
                </span>

              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {input
                  ? `Courses matching "${input}"`
                  : "Explore our courses"}
              </h2>

              <p className="mt-2 text-gray-500 text-sm md:text-base">
                {resultCount > 0
                  ? `${resultCount} ${
                      resultCount === 1 ? "course" : "courses"
                    } available for you`
                  : "Discover something new and start learning today."}
              </p>

            </div>

            {/* Result count */}
            <div className="flex items-center self-start md:self-auto gap-3 px-4 py-2.5 bg-orange-50 border border-orange-100 rounded-xl">

              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100">
                <span className="text-orange-600 text-lg">
                  📚
                </span>
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900 leading-none">
                  {resultCount}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Available
                </p>
              </div>

            </div>

          </div>


          {/* =====================================================
              NO COURSES AT ALL
          ====================================================== */}
          {allCourses.length === 0 ? (

            <div
              className="min-h-[400px] flex items-center justify-center"
              data-aos="fade-up"
            >

              <div className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm p-10 md:p-14 text-center max-w-lg w-full">

                {/* Background decoration */}
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-orange-100/60" />

                <div className="relative">

                  <div className="w-20 h-20 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-4xl">
                    📚
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mt-6">
                    No courses available
                  </h3>

                  <p className="text-gray-500 mt-3 leading-relaxed">
                    There are currently no courses available.
                    Please check back later for new learning
                    opportunities.
                  </p>

                  <button
                    onClick={() => navigate("/")}
                    className="mt-7 px-7 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Back to Home
                  </button>

                </div>

              </div>

            </div>

          ) : filteredCourses.length === 0 ? (

            /* =====================================================
                NO SEARCH RESULTS
            ====================================================== */
            <div
              className="min-h-[400px] flex items-center justify-center"
              data-aos="fade-up"
            >

              <div className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm p-10 md:p-14 text-center max-w-lg w-full">

                <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-orange-50" />

                <div className="relative">

                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl">
                    🔍
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mt-6">
                    No courses found
                  </h3>

                  <p className="text-gray-500 mt-3 leading-relaxed">
                    We couldn't find any courses matching
                    <span className="font-semibold text-gray-700">
                      {" "}"{input}"
                    </span>.
                    Try another keyword.
                  </p>

                  <button
                    onClick={() => navigate("/course-list")}
                    className="mt-7 px-7 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    View All Courses
                  </button>

                </div>

              </div>

            </div>

          ) : (

            /* =====================================================
                COURSE GRID
            ====================================================== */
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              data-aos="fade-up"
            >

              {filteredCourses.map((course, index) => (
                <div
                  key={course._id || index}
                  className="group"
                  data-aos="fade-up"
                  data-aos-delay={Math.min(index * 70, 350)}
                >

                  <CourseCard
                    course={course}
                    index={index}
                  />

                </div>
              ))}

            </div>

          )}

        </section>


        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}
        {filteredCourses.length > 0 && (
          <section
            className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pb-16"
            data-aos="fade-up"
          >

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-orange-500 px-7 md:px-12 py-10 md:py-12">

              {/* Decorative circles */}
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute right-20 -bottom-24 w-56 h-56 rounded-full bg-white/5" />

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-7">

                <div className="max-w-2xl text-white">

                  <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider mb-2">
                    Keep learning
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold">
                    Your next skill could change your future.
                  </h2>

                  <p className="mt-3 text-orange-100 text-sm md:text-base">
                    Choose a course, start learning, and take another
                    step toward your goals.
                  </p>

                </div>

                <button
                  onClick={() => navigate("/")}
                  className="self-start md:self-auto whitespace-nowrap px-7 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-300 shadow-sm"
                >
                  Back to Home
                </button>

              </div>

            </div>

          </section>
        )}

      </main>

      <Footer />
    </>
  );
};

export default CourseList;