import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import SearchBar from "./SearchBar";

const Hero = () => {
  const navigate = useNavigate();
  const { enrolledCourses, allCourses, userData } = useContext(AppContext);

  const firstName =
    userData?.name?.split(" ")[0] ||
    "Learner";

  const enrolledCount = enrolledCourses?.length || 0;
  const courseCount = allCourses?.length || 0;

  const currentCourse = enrolledCourses?.[0];

  const progress = Math.min(
    Math.max(
      Number(currentCourse?.progressPercentage || 0),
      0
    ),
    100
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100/60">

      {/* ================= BACKGROUND ================= */}

      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-orange-300/20 blur-3xl pointer-events-none" />

      <div className="absolute -top-20 -right-32 w-[28rem] h-[28rem] rounded-full bg-orange-200/30 blur-3xl pointer-events-none" />

      <div className="absolute bottom-0 left-1/3 w-72 h-40 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />

      {/* Decorative dots */}

      <div className="absolute top-24 left-[8%] w-2 h-2 rounded-full bg-orange-400/50" />
      <div className="absolute top-40 right-[12%] w-3 h-3 rounded-full bg-orange-300/50" />
      <div className="absolute bottom-20 right-[25%] w-2 h-2 rounded-full bg-orange-400/40" />


      {/* ================= MAIN ================= */}

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-14 md:py-20">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">


          {/* =====================================================
              LEFT CONTENT
          ====================================================== */}

          <div
            className="lg:col-span-3"
            data-aos="fade-right"
          >

            {/* Welcome */}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm">

              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600">
                👋
              </span>

              <span className="text-sm font-medium text-gray-700">
                Welcome back, {firstName}
              </span>

            </div>


            {/* Heading */}

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.08]">

              Learn something

              <span className="block text-orange-600">
                amazing today.
              </span>

            </h1>


            {/* Description */}

            <p className="mt-6 max-w-xl text-base sm:text-lg text-gray-600 leading-relaxed">
              Build valuable skills, explore new ideas, and keep moving
              forward with courses designed to help you achieve your goals.
            </p>


            {/* Search */}

            <div className="mt-8 max-w-2xl">

              <SearchBar />

            </div>


            {/* Buttons */}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">

              <button
                onClick={() => navigate("/course-list")}
                className="px-7 py-3.5 rounded-xl bg-orange-600 text-white font-semibold shadow-lg shadow-orange-600/20 hover:bg-orange-700 hover:-translate-y-0.5 transition-all duration-300"
              >
                Explore Courses
                <span className="ml-2">→</span>
              </button>

              {enrolledCount > 0 && (
                <button
                  onClick={() => navigate("/my-enrollments")}
                  className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300"
                >
                  Continue Learning
                </button>
              )}

            </div>


            {/* Trust points */}

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-gray-500">

              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs">
                  ✓
                </span>
                Practical learning
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs">
                  ✓
                </span>
                Learn at your pace
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs">
                  ✓
                </span>
                Earn certificates
              </div>

            </div>

          </div>


          {/* =====================================================
              RIGHT LEARNING CARD
          ====================================================== */}

          <div
            className="lg:col-span-2"
            data-aos="fade-left"
          >

            <div className="relative">

              {/* Floating decoration */}

              <div className="absolute -top-5 -right-5 w-20 h-20 bg-orange-200/50 rounded-3xl rotate-12" />

              <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-orange-100 rounded-2xl -rotate-12" />


              {/* Main Card */}

              <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl shadow-orange-900/10 p-6 sm:p-7">


                {/* Card Header */}

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                      Your Learning
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-1">
                      Learning Overview
                    </h2>

                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center text-xl">
                    📚
                  </div>

                </div>


                {/* Stats */}

                <div className="grid grid-cols-2 gap-4 mt-6">

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-xl">
                        🎯
                      </span>

                      <span className="text-xs text-gray-400">
                        Learning
                      </span>

                    </div>

                    <p className="text-2xl font-bold text-gray-900 mt-3">
                      {enrolledCount}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Enrolled courses
                    </p>

                  </div>


                  <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-xl">
                        🚀
                      </span>

                      <span className="text-xs text-orange-400">
                        Explore
                      </span>

                    </div>

                    <p className="text-2xl font-bold text-gray-900 mt-3">
                      {courseCount}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Available courses
                    </p>

                  </div>

                </div>


                {/* Current Course */}

                <div className="mt-5 rounded-2xl border border-gray-100 p-4">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">
                      📖
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-xs text-gray-400">
                        {currentCourse
                          ? "Continue where you left off"
                          : "Start your learning journey"}
                      </p>

                      <p className="font-semibold text-gray-800 truncate mt-1">
                        {currentCourse?.courseTitle ||
                          "Explore your first course"}
                      </p>

                    </div>

                  </div>


                  {/* Progress */}

                  {currentCourse ? (

                    <>

                      <div className="flex items-center justify-between mt-5 mb-2">

                        <span className="text-xs text-gray-500">
                          Course progress
                        </span>

                        <span className="text-xs font-bold text-orange-600">
                          {Math.round(progress)}%
                        </span>

                      </div>

                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-700"
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>


                      <button
                        onClick={() => navigate("/my-enrollments")}
                        className="w-full mt-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
                      >
                        Continue Learning →
                      </button>

                    </>

                  ) : (

                    <button
                      onClick={() => navigate("/course-list")}
                      className="w-full mt-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
                    >
                      Find a Course →
                    </button>

                  )}

                </div>


                {/* Bottom benefits */}

                <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                      ⚡
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-gray-800">
                        Learn Your Way
                      </p>

                      <p className="text-xs text-gray-500">
                        At your own pace
                      </p>

                    </div>

                  </div>


                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                      🎓
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-gray-800">
                        Certificates
                      </p>

                      <p className="text-xs text-gray-500">
                        Show your skills
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Bottom transition */}

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />

    </section>
  );
};

export default Hero;