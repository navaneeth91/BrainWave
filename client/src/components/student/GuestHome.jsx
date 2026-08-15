import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

import CourseSection from "./CourseSection";
import TestmonialsSection from "./TestmonialsSection";
import CallToAction from "./CallToAction";
import Footer from "./Footer";

const GuestHome = () => {
  const { navigate } = useContext(AppContext);

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-hidden">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#fffaf5]">

        {/* Background decoration */}

        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-orange-200/30 blur-3xl" />

        <div className="absolute -right-32 top-10 w-[500px] h-[500px] rounded-full bg-orange-100/50 blur-3xl" />

        <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] rounded-full bg-yellow-100/40 blur-3xl" />

        {/* Decorative dots */}

        <div className="absolute top-28 left-8 w-2 h-2 bg-orange-300 rounded-full" />
        <div className="absolute top-40 right-24 w-3 h-3 bg-orange-200 rounded-full" />
        <div className="absolute bottom-20 right-[28%] w-2 h-2 bg-orange-300 rounded-full" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-14 md:py-16 lg:py-20">

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* =================================================
                LEFT
            ================================================= */}

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm">

                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />

                <span className="text-xs md:text-sm font-semibold text-orange-700">
                  Learn. Build. Grow.
                </span>

              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1] text-gray-950">

                Learn skills.

                <br />

                <span className="text-orange-500">
                  Build your future.
                </span>

              </h1>

              <p className="mt-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                Master practical skills through structured courses,
                hands-on learning and industry-focused content designed
                to help you move forward.
              </p>

              {/* Buttons */}

              <div className="mt-7 flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() => navigate("/course-list")}
                  className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm md:text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Explore Courses

                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 font-bold text-sm md:text-base transition-all duration-300"
                >
                  Start Learning
                </button>

              </div>

              {/* Trust */}

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500">

                <div className="flex items-center gap-2">
                  <span className="text-orange-500 font-bold">✓</span>
                  Practical courses
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-orange-500 font-bold">✓</span>
                  Learn at your pace
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-orange-500 font-bold">✓</span>
                  Earn certificates
                </div>

              </div>

            </div>


            {/* =================================================
                RIGHT VISUAL
            ================================================= */}

            <div className="relative hidden lg:block">

              <div className="relative mx-auto w-[430px] xl:w-[460px]">

                {/* Glow */}

                <div className="absolute inset-0 bg-orange-300/30 blur-3xl rounded-full scale-75" />

                {/* Main dashboard */}

                <div className="relative bg-gray-950 rounded-[30px] p-4 shadow-2xl rotate-1">

                  {/* Browser */}

                  <div className="bg-gray-900 rounded-2xl px-5 py-3.5 flex items-center justify-between">

                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                    </div>

                    <div className="w-28 h-2 rounded-full bg-gray-700" />

                    <div className="w-6 h-6 rounded-full bg-orange-500" />

                  </div>


                  {/* Content */}

                  <div className="p-4">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[10px] tracking-wider text-gray-500 font-semibold">
                          YOUR LEARNING
                        </p>

                        <p className="text-white text-lg font-bold mt-1">
                          Keep growing
                        </p>

                      </div>

                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                        📚
                      </div>

                    </div>


                    {/* Courses */}

                    <div className="mt-5 space-y-3">

                      {/* Course 1 */}

                      <div className="bg-white rounded-2xl p-4">

                        <div className="flex items-center gap-3">

                          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                            ⚛️
                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="text-sm font-bold text-gray-900 truncate">
                              React Development
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              Continue learning
                            </p>

                          </div>

                          <span className="text-xs font-bold text-orange-500">
                            78%
                          </span>

                        </div>

                        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">

                          <div className="h-full w-[78%] bg-orange-500 rounded-full" />

                        </div>

                      </div>


                      {/* Course 2 */}

                      <div className="bg-gray-800 rounded-2xl p-4">

                        <div className="flex items-center gap-3">

                          <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            💻
                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="text-sm font-bold text-white truncate">
                              Full Stack Development
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              Hands-on learning
                            </p>

                          </div>

                          <span className="text-xs font-bold text-orange-400">
                            NEW
                          </span>

                        </div>

                      </div>


                      {/* Course 3 */}

                      <div className="bg-gray-800 rounded-2xl p-4">

                        <div className="flex items-center gap-3">

                          <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center">
                            ☁️
                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="text-sm font-bold text-white truncate">
                              Cloud Fundamentals
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              Beginner friendly
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* Achievement */}

                <div className="absolute -left-10 bottom-8 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-lg">
                      🎓
                    </div>

                    <div>

                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                        Achievement
                      </p>

                      <p className="text-sm font-bold text-gray-900">
                        Certificate earned
                      </p>

                    </div>

                  </div>

                </div>


                {/* Progress */}

                <div className="absolute -right-7 top-16 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3">

                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Course progress
                  </p>

                  <p className="text-xl font-black text-orange-500 mt-1">
                    78%
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          QUICK BENEFITS
      ===================================================== */}

      <section className="bg-white border-b border-gray-100">

        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-6">

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

            {/* Benefit 1 */}

            <div className="flex items-center gap-4 py-4 sm:py-2 sm:px-6 first:sm:pl-0">

              <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center text-lg">
                🚀
              </div>

              <div>

                <p className="font-bold text-gray-900 text-sm">
                  Learn at your pace
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Flexible learning anytime
                </p>

              </div>

            </div>


            {/* Benefit 2 */}

            <div className="flex items-center gap-4 py-4 sm:py-2 sm:px-6">

              <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                📈
              </div>

              <div>

                <p className="font-bold text-gray-900 text-sm">
                  Track your progress
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Know exactly where you stand
                </p>

              </div>

            </div>


            {/* Benefit 3 */}

            <div className="flex items-center gap-4 py-4 sm:py-2 sm:px-6 sm:pr-0">

              <div className="w-11 h-11 shrink-0 rounded-xl bg-yellow-50 flex items-center justify-center text-lg">
                🎓
              </div>

              <div>

                <p className="font-bold text-gray-900 text-sm">
                  Earn certificates
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Showcase what you achieve
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          COURSES
      ===================================================== */}

      <section className="py-14 md:py-16">

        <CourseSection />

      </section>


      {/* =====================================================
          WHY BRAINWAVE
      ===================================================== */}

      <section className="px-6 md:px-10 lg:px-16 py-16 md:py-20 bg-gray-50">

        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-2xl mx-auto">

            <p className="text-sm font-bold tracking-wider text-orange-600 uppercase">
              Why BrainWave
            </p>

            <h2 className="text-3xl md:text-4xl font-black text-gray-950 mt-3 tracking-tight">
              Learn skills that actually move you forward.
            </h2>

            <p className="text-gray-500 mt-4 leading-relaxed">
              Everything you need to learn practical skills,
              stay consistent and turn knowledge into real progress.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">

            {[
              {
                icon: "📚",
                title: "Structured learning",
                description:
                  "Follow organized courses that make complex topics easier to understand.",
              },
              {
                icon: "⚡",
                title: "Practical knowledge",
                description:
                  "Learn useful skills that you can apply to real projects and problems.",
              },
              {
                icon: "🎓",
                title: "Prove your progress",
                description:
                  "Complete courses and earn certificates that showcase your achievements.",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="group bg-white rounded-2xl border border-gray-100 p-7 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
              >

                <div className="w-13 h-13 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>

                <h3 className="text-lg md:text-xl font-bold text-gray-900 mt-5">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed mt-2.5">
                  {item.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="px-6 md:px-10 lg:px-16 py-16 md:py-20 bg-white">

        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-2xl mx-auto">

            <p className="text-sm font-bold tracking-wider text-orange-600 uppercase">
              Simple process
            </p>

            <h2 className="text-3xl md:text-4xl font-black text-gray-950 mt-3">
              Start learning in three simple steps
            </h2>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

            {[
              {
                number: "01",
                title: "Choose a course",
                description:
                  "Explore courses and choose one that matches your goals.",
              },
              {
                number: "02",
                title: "Learn & practice",
                description:
                  "Watch lessons, understand concepts and practice your skills.",
              },
              {
                number: "03",
                title: "Complete & achieve",
                description:
                  "Finish your course, pass the assessment and earn your certificate.",
              },
            ].map((item) => (

              <div
                key={item.number}
                className="relative bg-gray-50 rounded-2xl border border-gray-100 p-7"
              >

                <div className="flex items-center gap-4">

                  <span className="w-12 h-12 shrink-0 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
                    {item.number}
                  </span>

                  <h3 className="text-lg font-bold text-gray-900">
                    {item.title}
                  </h3>

                </div>

                <p className="text-sm text-gray-500 leading-relaxed mt-4">
                  {item.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          TESTIMONIALS
      ===================================================== */}

      <TestmonialsSection />


      {/* =====================================================
          CTA
      ===================================================== */}

      <CallToAction />


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />

    </main>
  );
};

export default GuestHome;