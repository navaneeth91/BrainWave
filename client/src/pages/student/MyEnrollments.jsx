import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import { AppContext } from "../../context/AppContext";
import Footer from "../../components/student/Footer";
import axios from "axios";
import { toast } from "react-toastify";

const MyEnrollments = () => {
  const {
    enrolledCourses,
    calculateCourseDuration,
    calculateNoofLectures,
    navigate,
    userData,
    backendUrl,
    fetchEnrolledCourses,
    getToken,
  } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([]);
  const [examStatus, setExamStatus] = useState({});
  const [loading, setLoading] = useState(true);

  // =========================================================
  // GET COURSE PROGRESS + EXAM STATUS
  // =========================================================

  const getCourseProgress = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const tempProgressArray = [];
      const tempExamStatus = {};

      for (const course of enrolledCourses) {
        try {
          const { data: progressResponse } = await axios.get(
            `${backendUrl}/api/user/course-progress/${course._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const totalLectures = calculateNoofLectures(course);

          const completedLectures = Array.isArray(
            progressResponse?.progressData?.lectureCompleted
          )
            ? progressResponse.progressData.lectureCompleted.length
            : 0;

          tempProgressArray.push({
            completedLectures,
            totalLectures,
          });
        } catch (error) {
          console.error(
            `Progress error for ${course._id}:`,
            error
          );

          tempProgressArray.push({
            completedLectures: 0,
            totalLectures: calculateNoofLectures(course),
          });
        }

        // =====================================================
        // EXAM
        // =====================================================

        try {
          const { data: examResponse } = await axios.get(
            `${backendUrl}/api/exam/course/${course._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (examResponse.success && examResponse.exam) {
            const examId = examResponse.exam._id;

            const { data: attemptsResponse } = await axios.get(
              `${backendUrl}/api/exam/${examId}/attempts`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const attempts =
              attemptsResponse?.attempts || [];

            const passed = attempts.some(
              (attempt) => attempt.passed === true
            );

            tempExamStatus[course._id] = {
              hasExam: true,
              examId,
              passed,
            };
          } else {
            tempExamStatus[course._id] = {
              hasExam: false,
              examId: null,
              passed: false,
            };
          }
        } catch {
          tempExamStatus[course._id] = {
            hasExam: false,
            examId: null,
            passed: false,
          };
        }
      }

      setProgressArray(tempProgressArray);
      setExamStatus(tempExamStatus);
    } catch (error) {
      console.error(
        "Error fetching course progress:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load course progress"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH ENROLLED COURSES
  // =========================================================

  useEffect(() => {
    if (userData) {
      fetchEnrolledCourses();
    }
  }, [userData]);

  // =========================================================
  // LOAD PROGRESS
  // =========================================================

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    } else {
      setLoading(false);
    }
  }, [enrolledCourses]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalCourses = enrolledCourses.length;

  const completedCourses = enrolledCourses.filter(
    (course, index) => {
      const progress = progressArray[index];

      return (
        progress &&
        progress.totalLectures > 0 &&
        progress.completedLectures ===
          progress.totalLectures
      );
    }
  ).length;

  const ongoingCourses =
    totalCourses - completedCourses;

  const certificateCount = enrolledCourses.filter(
    (course) => examStatus[course._id]?.passed
  ).length;

  const overallProgress =
    totalCourses > 0
      ? Math.round(
          (completedCourses / totalCourses) * 100
        )
      : 0;

  // =========================================================
  // COURSE STATUS
  // =========================================================

  const getCourseStatus = (course, index) => {
    const progress = progressArray[index];
    const exam = examStatus[course._id];

    if (!progress) {
      return {
        label: "Loading",
        type: "loading",
      };
    }

    const courseCompleted =
      progress.totalLectures > 0 &&
      progress.completedLectures ===
        progress.totalLectures;

    if (!courseCompleted) {
      return {
        label: "In Progress",
        type: "progress",
      };
    }

    if (exam?.hasExam && exam?.passed) {
      return {
        label: "Completed",
        type: "completed",
      };
    }

    if (courseCompleted && exam?.hasExam) {
      return {
        label: "Exam Pending",
        type: "exam",
      };
    }

    return {
      label: "Completed",
      type: "completed",
    };
  };

  // =========================================================
  // ACTION BUTTON
  // =========================================================

  const getActionButton = (course, index) => {
    const progress = progressArray[index];
    const exam = examStatus[course._id];

    if (!progress) {
      return (
        <button
          disabled
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed"
        >
          Loading...
        </button>
      );
    }

    const courseCompleted =
      progress.totalLectures > 0 &&
      progress.completedLectures ===
        progress.totalLectures;

    if (!courseCompleted) {
      return (
        <button
          onClick={() =>
            navigate(`/player/${course._id}`)
          }
          className="group/btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-orange-600 text-white text-xs font-bold transition-all duration-300"
        >
          Continue
          <span className="group-hover/btn:translate-x-1 transition-transform">
            →
          </span>
        </button>
      );
    }

    if (exam?.hasExam && exam?.passed) {
      return (
        <button
          onClick={() =>
            navigate(
              `/certificate/course/${course._id}`
            )
          }
          className="group/btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all duration-300"
        >
          Certificate
          <span>🎓</span>
        </button>
      );
    }

    if (courseCompleted && exam?.hasExam) {
      return (
        <button
          onClick={() =>
            navigate(
              `/student/exam/${exam.examId}`
            )
          }
          className="group/btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all duration-300"
        >
          Take Exam
          <span className="group-hover/btn:translate-x-1 transition-transform">
            →
          </span>
        </button>
      );
    }

    return (
      <button
        disabled
        className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed"
      >
        Exam Unavailable
      </button>
    );
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const StatusBadge = ({ status }) => {
    const config = {
      progress: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        dot: "bg-orange-500",
      },

      completed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      },

      exam: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-500",
      },

      loading: {
        bg: "bg-gray-100",
        text: "text-gray-500",
        dot: "bg-gray-400",
      },
    };

    const style =
      config[status.type] || config.loading;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${style.bg} ${style.text} text-[10px] font-bold`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
        />

        {status.label}
      </span>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <>
        <main className="min-h-[75vh] bg-[#f7f8fa] flex items-center justify-center">
          <div className="text-center">

            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-orange-100" />

              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
            </div>

            <h3 className="mt-5 text-sm font-bold text-gray-800">
              Preparing your learning space
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Fetching your courses and progress...
            </p>

          </div>
        </main>

        <Footer />
      </>
    );
  }

  // =========================================================
  // EMPTY STATE
  // =========================================================

  if (enrolledCourses.length === 0) {
    return (
      <>
        <main className="min-h-screen bg-[#f7f8fa]">

          <section className="relative overflow-hidden bg-gray-950">

            <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-14">

              <p className="text-orange-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                My Learning
              </p>

              <h1 className="mt-3 text-3xl md:text-4xl font-black text-white tracking-tight">
                Start your learning journey.
              </h1>

              <p className="mt-3 max-w-xl text-sm text-gray-400">
                Enroll in a course and start building skills
                that move you forward.
              </p>

            </div>

          </section>

          <section className="max-w-3xl mx-auto px-6 -mt-7 pb-16">

            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-xl p-8 md:p-12 text-center">

              <div className="w-16 h-16 mx-auto rounded-xl bg-orange-50 flex items-center justify-center">
                <span className="text-3xl">
                  📚
                </span>
              </div>

              <h2 className="mt-5 text-xl font-black text-gray-900">
                No courses yet
              </h2>

              <p className="mt-2 max-w-md mx-auto text-sm text-gray-500 leading-relaxed">
                You haven't enrolled in any courses yet.
                Explore the course catalog and find something
                worth learning.
              </p>

              <button
                onClick={() =>
                  navigate("/course-list")
                }
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-lg"
              >
                Explore Courses
                <span>→</span>
              </button>

            </div>

          </section>
        </main>

        <Footer />
      </>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <>
      <main className="min-h-screen bg-[#f7f8fa]">

        {/* =====================================================
            COMPACT HERO
        ===================================================== */}

        <section className="relative overflow-hidden bg-gray-950">

          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-orange-500/10 rounded-full blur-[100px]" />

          <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-10 pb-20">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-7">

              <div>

                <div className="flex items-center gap-2">

                  <span className="w-6 h-px bg-orange-500" />

                  <span className="text-orange-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                    My Learning
                  </span>

                </div>

                <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">

                  Welcome back
                  {userData?.name
                    ? `, ${userData.name.split(" ")[0]}`
                    : ""}
                  .

                </h1>

                <p className="mt-3 text-sm text-gray-400 max-w-lg">
                  Keep learning, complete your courses and
                  turn your progress into achievements.
                </p>

              </div>

              <button
                onClick={() =>
                  navigate("/my-certificates")
                }
                className="group inline-flex items-center gap-2.5 self-start md:self-auto px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-gray-900 border border-white/10 transition-all duration-300"
              >

                <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-sm">
                  🎓
                </span>

                <span className="text-xs font-bold">
                  My Certificates
                </span>

                <span className="text-sm group-hover:translate-x-1 transition-transform">
                  →
                </span>

              </button>

            </div>

          </div>
        </section>


        {/* =====================================================
            COMPACT STATS
        ===================================================== */}

        <section className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 -mt-9">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Total */}

            <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 hover:-translate-y-0.5 transition-all">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Enrolled
                  </p>

                  <p className="mt-1 text-2xl font-black text-gray-900">
                    {totalCourses}
                  </p>

                </div>

                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-sm">
                  📚
                </div>

              </div>

            </div>


            {/* Ongoing */}

            <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 hover:-translate-y-0.5 transition-all">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Learning
                  </p>

                  <p className="mt-1 text-2xl font-black text-gray-900">
                    {ongoingCourses}
                  </p>

                </div>

                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-sm">
                  ◴
                </div>

              </div>

            </div>


            {/* Completed */}

            <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 hover:-translate-y-0.5 transition-all">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Finished
                  </p>

                  <p className="mt-1 text-2xl font-black text-gray-900">
                    {completedCourses}
                  </p>

                </div>

                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-sm text-emerald-600">
                  ✓
                </div>

              </div>

            </div>


            {/* Certificates */}

            <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 hover:-translate-y-0.5 transition-all">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Certificates
                  </p>

                  <p className="mt-1 text-2xl font-black text-gray-900">
                    {certificateCount}
                  </p>

                </div>

                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-sm">
                  🎓
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            COURSES
        ===================================================== */}

        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-10 pb-14">

          {/* Heading */}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">

            <div>

              <div className="flex items-center gap-2">

                <span className="w-1 h-5 bg-orange-500 rounded-full" />

                <h2 className="text-xl md:text-2xl font-black text-gray-900">
                  Your Courses
                </h2>

              </div>

              <p className="mt-1.5 text-xs text-gray-500">
                Continue where you left off.
              </p>

            </div>


            <div className="flex items-center gap-2">

              <div className="hidden sm:block w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">

                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />

              </div>

              <span className="text-[10px] font-bold text-gray-500">
                {overallProgress}% complete
              </span>

            </div>

          </div>


          {/* =====================================================
              COURSE CARDS
          ===================================================== */}

          <div className="space-y-3">

            {enrolledCourses.map((course, index) => {

              const progress = progressArray[index];

              const completedLectures =
                progress?.completedLectures || 0;

              const totalLectures =
                progress?.totalLectures || 0;

              const percentage =
                totalLectures > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (completedLectures /
                          totalLectures) *
                          100
                      )
                    )
                  : 0;

              const status =
                getCourseStatus(course, index);

              return (

                <article
                  key={course._id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >

                  <div className="flex flex-col md:flex-row">

                    {/* =================================================
                        SMALL THUMBNAIL
                    ================================================= */}

                    <div
                      className="relative w-full md:w-[210px] lg:w-[230px] shrink-0 h-[170px] md:h-auto md:min-h-[190px] cursor-pointer overflow-hidden"
                      onClick={() =>
                        navigate(`/player/${course._id}`)
                      }
                    >

                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Status */}

                      <div className="absolute top-3 left-3">
                        <StatusBadge status={status} />
                      </div>

                      {/* Percentage */}

                      <div className="absolute bottom-3 left-3">

                        <p className="text-[10px] text-white/70">
                          Progress
                        </p>

                        <p className="text-sm font-black text-white">
                          {percentage}%
                        </p>

                      </div>

                    </div>


                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div className="flex-1 p-5 md:p-5 lg:p-6">

                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

                        <div className="min-w-0">

                          {/* Meta */}

                          <div className="flex items-center gap-2 mb-1.5">

                            <span className="text-[9px] font-bold uppercase tracking-wider text-orange-600">
                              Course{" "}
                              {String(index + 1).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <span className="w-1 h-1 rounded-full bg-gray-300" />

                            <span className="text-[9px] text-gray-400">
                              {calculateCourseDuration(
                                course
                              )}
                            </span>

                          </div>


                          {/* Title */}

                          <h3
                            onClick={() =>
                              navigate(
                                `/player/${course._id}`
                              )
                            }
                            className="text-lg md:text-xl font-black text-gray-900 leading-tight cursor-pointer hover:text-orange-600 transition-colors line-clamp-2"
                          >
                            {course.courseTitle}
                          </h3>

                        </div>


                        {/* Desktop Status */}

                        <div className="hidden lg:block shrink-0">
                          <StatusBadge status={status} />
                        </div>

                      </div>


                      {/* Progress */}

                      <div className="mt-5">

                        <div className="flex items-center justify-between mb-2">

                          <div className="flex items-center gap-2">

                            <span className="text-[10px] font-bold text-gray-500">
                              {completedLectures}
                              <span className="text-gray-400">
                                {" "}
                                / {totalLectures}
                              </span>{" "}
                              lectures
                            </span>

                          </div>

                          <span className="text-xs font-black text-gray-800">
                            {percentage}%
                          </span>

                        </div>


                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              percentage === 100
                                ? "bg-emerald-500"
                                : "bg-orange-500"
                            }`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>


                      {/* Bottom */}

                      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div className="flex items-center gap-2">

                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                              percentage === 100
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-orange-50 text-orange-600"
                            }`}
                          >
                            {percentage === 100
                              ? "✓"
                              : "▶"}
                          </div>

                          <div>

                            <p className="text-[11px] font-bold text-gray-700">
                              {percentage === 100
                                ? "Course completed"
                                : "Keep learning"}
                            </p>

                            <p className="text-[9px] text-gray-400">
                              {percentage === 100
                                ? "Ready for the next step"
                                : "Continue from where you stopped"}
                            </p>

                          </div>

                        </div>


                        <div className="w-full sm:w-auto">

                          {getActionButton(
                            course,
                            index
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                </article>

              );
            })}

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
};

export default MyEnrollments;