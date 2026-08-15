import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import CourseSection from "../../components/student/CourseSection";
import Footer from "../../components/student/Footer";

import {
  ArrowRight,
  BookOpen,
  Award,
  Clock3,
  CheckCircle2,
  Play,
  Sparkles,
  TrendingUp,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

const LoggedInHome = () => {
  const {
    userData,
    enrolledCourses,
    navigate,
    backendUrl,
    getToken,
  } = useContext(AppContext);

  // ============================================================
  // STATE
  // ============================================================

  const [courseProgress, setCourseProgress] = useState({});
  const [progressLoading, setProgressLoading] = useState(true);

  // ============================================================
  // COURSES
  // ============================================================

  const courses = enrolledCourses || [];

  // ============================================================
  // GET COURSE ID
  // Handles both:
  // course._id
  // course.courseId
  // ============================================================

  const getCourseId = (course) => {
    return course?.courseId || course?._id;
  };

  // ============================================================
  // FETCH REAL COURSE PROGRESS
  // ============================================================

  useEffect(() => {
    const fetchProgress = async () => {
      if (!courses.length) {
        setCourseProgress({});
        setProgressLoading(false);
        return;
      }

      try {
        setProgressLoading(true);

        const token = await getToken();

        const results = await Promise.all(
          courses.map(async (course) => {
            const courseId = getCourseId(course);

            if (!courseId) {
              return null;
            }

            try {
              const { data } = await axios.get(
                `${backendUrl}/api/user/course-progress/${courseId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const progressData = data?.progressData;

              const completedLectures =
                progressData?.completedLectures || 0;

              const totalLectures =
                progressData?.totalLectures || 0;

              const percentage =
                totalLectures > 0
                  ? Math.round(
                      (completedLectures / totalLectures) * 100
                    )
                  : 0;

              return {
                courseId,
                completedLectures,
                totalLectures,
                percentage,
                completed:
                  progressData?.completed ||
                  percentage >= 100,
              };
            } catch (error) {
              console.error(
                `Failed to fetch progress for course ${courseId}:`,
                error
              );

              return {
                courseId,
                completedLectures: 0,
                totalLectures: 0,
                percentage: 0,
                completed: false,
              };
            }
          })
        );

        const progressMap = {};

        results.forEach((result) => {
          if (result?.courseId) {
            progressMap[result.courseId] = result;
          }
        });

        setCourseProgress(progressMap);
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
        setProgressLoading(false);
      }
    };

    fetchProgress();
  }, [enrolledCourses, backendUrl, getToken]);

  // ============================================================
  // ADD REAL PROGRESS TO EACH COURSE
  // ============================================================

  const coursesWithProgress = useMemo(() => {
    return courses.map((course) => {
      const courseId = getCourseId(course);

      const progressData =
        courseProgress[courseId];

      return {
        ...course,

        courseId,

        progress: progressData?.percentage || 0,

        completedLectures:
          progressData?.completedLectures || 0,

        totalLectures:
          progressData?.totalLectures || 0,

        isCompleted:
          progressData?.completed ||
          (progressData?.percentage || 0) >= 100,
      };
    });
  }, [courses, courseProgress]);

  // ============================================================
  // COURSE STATISTICS
  // ============================================================

  const completedCourses = coursesWithProgress.filter(
    (course) => course.isCompleted
  );

  const inProgressCourses = coursesWithProgress.filter(
    (course) =>
      course.progress > 0 &&
      course.progress < 100
  );

  const notStartedCourses = coursesWithProgress.filter(
    (course) => course.progress === 0
  );

  // ============================================================
  // OVERALL PROGRESS
  // ============================================================

  const overallProgress =
    coursesWithProgress.length > 0
      ? Math.round(
          coursesWithProgress.reduce(
            (total, course) =>
              total + course.progress,
            0
          ) / coursesWithProgress.length
        )
      : 0;

  // ============================================================
  // CONTINUE COURSE
  // Priority:
  // 1. In-progress course
  // 2. Not started course
  // 3. First course
  // ============================================================

  const continueCourse =
    inProgressCourses[0] ||
    notStartedCourses[0] ||
    coursesWithProgress[0] ||
    null;

  // ============================================================
  // USER NAME
  // ============================================================

  const firstName =
    userData?.name?.split(" ")[0] ||
    "Learner";

  // ============================================================
  // STATISTICS
  // ============================================================

  const stats = [
    {
      title: "My Courses",
      value: coursesWithProgress.length,
      description: "Enrolled courses",
      icon: BookOpen,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "In Progress",
      value: inProgressCourses.length,
      description: "Courses you're learning",
      icon: Clock3,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Completed",
      value: completedCourses.length,
      description: "Courses completed",
      icon: CheckCircle2,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Certificates",
      value: completedCourses.length,
      description: "Achievements earned",
      icon: Award,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  // ============================================================
  // HELPER
  // ============================================================

  const openCourse = (course) => {
    const courseId = getCourseId(course);

    if (courseId) {
      navigate(`/player/${courseId}`);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-gray-900">

      {/* =====================================================
          HERO / WELCOME
      ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50" />

        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />

        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl" />

        <div className="relative max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16">

          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

            {/* LEFT */}

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm mb-5">

                <Sparkles className="w-4 h-4 text-orange-500" />

                <span className="text-sm font-medium text-gray-600">
                  Keep learning. Keep growing.
                </span>

              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">

                Welcome back,{" "}

                <span className="text-orange-600">
                  {firstName}
                </span>

                👋

              </h1>

              <p className="mt-5 text-gray-500 text-base md:text-lg leading-7 max-w-2xl">

                Continue your learning journey, explore new
                skills, and make progress toward your goals.

              </p>

              <div className="flex flex-wrap gap-3 mt-7">

                <button
                  onClick={() =>
                    continueCourse
                      ? openCourse(continueCourse)
                      : navigate("/course-list")
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-0.5"
                >

                  <Play className="w-4 h-4 fill-current" />

                  {continueCourse
                    ? "Continue Learning"
                    : "Explore Courses"}

                  <ArrowRight className="w-4 h-4" />

                </button>

                <button
                  onClick={() =>
                    navigate("/my-enrollments")
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-700 font-semibold transition-all"
                >

                  My Learning

                  <ChevronRight className="w-4 h-4" />

                </button>

              </div>

            </div>


            {/* RIGHT - PROGRESS */}

            <div className="w-full max-w-sm">

              <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/40 p-6">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <p className="text-sm text-gray-500">
                      Overall Progress
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-1">
                      Your learning journey
                    </h3>

                  </div>

                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">

                    <TrendingUp className="w-5 h-5 text-orange-600" />

                  </div>

                </div>


                <div className="flex items-center gap-6">

                  {/* CIRCLE */}

                  <div className="relative w-28 h-28 shrink-0">

                    <svg
                      className="w-28 h-28 -rotate-90"
                      viewBox="0 0 120 120"
                    >

                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-gray-100"
                      />

                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${overallProgress * 3.01} 301`}
                        className="text-orange-500 transition-all duration-700"
                      />

                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">

                      <p className="text-2xl font-bold text-gray-900">
                        {progressLoading
                          ? "..."
                          : `${overallProgress}%`}
                      </p>

                    </div>

                  </div>


                  <div>

                    <p className="text-sm text-gray-500">
                      Keep going!
                    </p>

                    <p className="text-sm font-semibold text-gray-800 mt-1">

                      {completedCourses.length} course
                      {completedCourses.length !== 1
                        ? "s"
                        : ""}{" "}
                      completed

                    </p>

                    <p className="text-xs text-gray-400 mt-2">

                      Every lesson brings you closer
                      to your goal.

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16 -mt-5 relative z-10">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {stats.map((stat) => {

            const Icon = stat.icon;

            return (

              <div
                key={stat.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      {stat.title}
                    </p>

                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>

                  </div>

                  <div
                    className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}
                  >

                    <Icon
                      className={`w-5 h-5 ${stat.iconColor}`}
                    />

                  </div>

                </div>

                <p className="text-xs text-gray-400 mt-3">
                  {stat.description}
                </p>

              </div>

            );

          })}

        </div>

      </section>


      {/* =====================================================
          CONTINUE LEARNING
      ===================================================== */}

      {continueCourse && (

        <section className="max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16 pt-14">

          <div className="flex items-end justify-between mb-6">

            <div>

              <div className="flex items-center gap-2 mb-2">

                <span className="w-2 h-2 rounded-full bg-orange-500" />

                <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">

                  Pick up where you left off

                </span>

              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Continue Learning
              </h2>

            </div>

            <button
              onClick={() =>
                navigate("/my-enrollments")
              }
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-orange-600 transition"
            >

              View all

              <ArrowRight className="w-4 h-4" />

            </button>

          </div>


          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="flex flex-col lg:flex-row">

              {/* THUMBNAIL */}

              <div className="lg:w-[42%] relative">

                <img
                  src={
                    continueCourse.courseThumbnail ||
                    continueCourse.thumbnail
                  }
                  alt={continueCourse.courseTitle}
                  className="w-full h-56 lg:h-full min-h-[260px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5">

                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-gray-800">

                    <Play className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />

                    Continue Course

                  </span>

                </div>

              </div>


              {/* DETAILS */}

              <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-center">

                <p className="text-sm font-medium text-orange-600">
                  Your current course
                </p>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {continueCourse.courseTitle}
                </h3>

                <p className="text-gray-500 mt-3 max-w-2xl">

                  Continue from where you stopped
                  and keep building your skills.

                </p>


                {/* PROGRESS */}

                <div className="mt-7">

                  <div className="flex items-center justify-between mb-2">

                    <span className="text-sm font-medium text-gray-700">
                      Course Progress
                    </span>

                    <span className="text-sm font-bold text-orange-600">

                      {progressLoading
                        ? "..."
                        : `${continueCourse.progress}%`}

                    </span>

                  </div>

                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          continueCourse.progress,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  {/* Lecture count */}

                  {!progressLoading &&
                    continueCourse.totalLectures > 0 && (

                      <p className="text-xs text-gray-400 mt-2">

                        {continueCourse.completedLectures} of{" "}
                        {continueCourse.totalLectures} lectures completed

                      </p>

                    )}

                </div>


                <div className="flex flex-wrap items-center gap-4 mt-7">

                  <button
                    onClick={() =>
                      openCourse(continueCourse)
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all shadow-md shadow-orange-600/20"
                  >

                    <Play className="w-4 h-4 fill-current" />

                    {continueCourse.isCompleted
                      ? "Review Course"
                      : "Continue Learning"}

                  </button>

                  <span className="text-sm text-gray-400">

                    {continueCourse.progress}% completed

                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!continueCourse &&
        coursesWithProgress.length === 0 && (

          <section className="max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16 pt-14">

            <div className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl p-8 md:p-12">

              <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">

                <div>

                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-5">

                    <GraduationCap className="w-7 h-7 text-orange-600" />

                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Start your learning journey
                  </h2>

                  <p className="text-gray-500 mt-3 max-w-xl">

                    You haven't enrolled in any courses yet.
                    Explore our courses and start learning
                    something new today.

                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate("/course-list")
                  }
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
                >

                  Explore Courses

                  <ArrowRight className="w-4 h-4" />

                </button>

              </div>

            </div>

          </section>

        )}


      {/* =====================================================
          MY COURSES
      ===================================================== */}

      {coursesWithProgress.length > 0 && (

        <section className="max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16 pt-14">

          <div className="flex items-end justify-between mb-7">

            <div>

              <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
                Your learning
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                My Courses
              </h2>

            </div>

            <button
              onClick={() =>
                navigate("/my-enrollments")
              }
              className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-orange-600 transition"
            >

              View all

              <ArrowRight className="w-4 h-4" />

            </button>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {coursesWithProgress
              .slice(0, 3)
              .map((course, index) => (

                <div
                  key={course._id || course.courseId || index}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >

                  {/* IMAGE */}

                  <div className="relative">

                    <img
                      src={
                        course.courseThumbnail ||
                        course.thumbnail
                      }
                      alt={course.courseTitle}
                      className="w-full h-44 object-cover"
                    />

                    <div className="absolute top-3 right-3">

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                          course.isCompleted
                            ? "bg-green-100/95 text-green-700"
                            : "bg-white/95 text-gray-700"
                        }`}
                      >

                        {course.isCompleted
                          ? "Completed"
                          : `${course.progress}% Complete`}

                      </span>

                    </div>

                  </div>


                  {/* CONTENT */}

                  <div className="p-5">

                    <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[48px]">
                      {course.courseTitle}
                    </h3>


                    <div className="mt-5">

                      <div className="flex items-center justify-between text-xs mb-2">

                        <span className="text-gray-500">
                          Progress
                        </span>

                        <span className="font-semibold text-orange-600">

                          {course.progress}%

                        </span>

                      </div>


                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-orange-500 rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(
                              course.progress,
                              100
                            )}%`,
                          }}
                        />

                      </div>


                      {course.totalLectures > 0 && (

                        <p className="text-xs text-gray-400 mt-2">

                          {course.completedLectures} /{" "}
                          {course.totalLectures} lectures

                        </p>

                      )}

                    </div>


                    <button
                      onClick={() =>
                        openCourse(course)
                      }
                      className="w-full mt-5 py-2.5 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm font-semibold text-gray-700 hover:text-orange-600 transition flex items-center justify-center gap-2"
                    >

                      {course.isCompleted
                        ? "Review Course"
                        : course.progress > 0
                        ? "Continue"
                        : "Start Course"}

                      <ArrowRight className="w-4 h-4" />

                    </button>

                  </div>

                </div>

              ))}

          </div>

        </section>

      )}


      {/* =====================================================
          EXPLORE COURSES
      ===================================================== */}

      <section className="pt-16">

        <div className="max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16">

          <div className="flex items-end justify-between mb-8">

            <div>

              <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
                Discover something new
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                Explore Courses
              </h2>

              <p className="text-gray-500 mt-2">
                Find your next skill to learn.
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/course-list")
              }
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
            >

              Browse all

              <ArrowRight className="w-4 h-4" />

            </button>

          </div>

        </div>

        <CourseSection />

      </section>


      {/* =====================================================
          MOTIVATION BANNER
      ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-6 md:px-10 lg:px-16 py-16">

        <div className="relative overflow-hidden rounded-3xl bg-gray-950 p-8 md:p-12">

          <div className="absolute -right-20 -top-32 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl" />

          <div className="absolute -left-20 -bottom-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">

            <div>

              <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold mb-3">

                <Sparkles className="w-4 h-4" />

                Keep pushing forward

              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white">

                Every skill you learn

                <span className="text-orange-500">
                  {" "}builds your future.
                </span>

              </h2>

              <p className="text-gray-400 mt-3 max-w-xl">

                Stay consistent, complete your courses,
                and build a stronger version of yourself
                one lesson at a time.

              </p>

            </div>

            <button
              onClick={() =>
                navigate("/course-list")
              }
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
            >

              Find a Course

              <ArrowRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />

    </main>
  );
};

export default LoggedInHome;