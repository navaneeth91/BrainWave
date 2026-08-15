import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  Users,
  Wallet,
  CalendarDays,
  Search,
  SlidersHorizontal,
  Plus,
  ClipboardCheck,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

const MyCourse = () => {
  const {
    currency,
    backendUrl,
    getToken,
    isEducator,
  } = useContext(AppContext);

  const [courses, setCourses] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const navigate = useNavigate();

  // ==========================================
  // FETCH COURSES
  // ==========================================

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(
        `${backendUrl}/api/educator/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(
        "Fetch educator courses error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load courses"
      );
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses();
    }
  }, [isEducator]);

  // ==========================================
  // FILTER + SORT
  // ==========================================

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    let result = [...courses];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((course) =>
        course.courseTitle
          ?.toLowerCase()
          .includes(query)
      );
    }

    if (sortBy === "latest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
    }

    if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );
    }

    if (sortBy === "students") {
      result.sort(
        (a, b) =>
          (b.enrolledStudents?.length || 0) -
          (a.enrolledStudents?.length || 0)
      );
    }

    if (sortBy === "earnings") {
      result.sort((a, b) => {
        const earningsA =
          (a.enrolledStudents?.length || 0) *
          (a.coursePrice -
            (a.discount * a.coursePrice) / 100);

        const earningsB =
          (b.enrolledStudents?.length || 0) *
          (b.coursePrice -
            (b.discount * b.coursePrice) / 100);

        return earningsB - earningsA;
      });
    }

    return result;
  }, [courses, search, sortBy]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalCourses = courses?.length || 0;

  const totalStudents =
    courses?.reduce(
      (total, course) =>
        total +
        (course.enrolledStudents?.length || 0),
      0
    ) || 0;

  const totalEarnings =
    courses?.reduce((total, course) => {
      const price =
        course.coursePrice -
        (course.discount * course.coursePrice) /
          100;

      return (
        total +
        (course.enrolledStudents?.length || 0) *
          price
      );
    }, 0) || 0;

  // ==========================================
  // LOADING
  // ==========================================

  if (!courses) {
    return <Loading />;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-7">

        <div>

          <div className="flex items-center gap-2 text-orange-500 text-sm font-medium mb-1">

            <BookOpen size={16} />

            Course Management

          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Courses
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage your courses, students and exams
            from one place.
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/educator/add-course")
          }
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md shadow-orange-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} />

          Add New Course
        </button>

      </div>

      {/* ===================================== */}
      {/* STAT CARDS */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-7">

        {/* COURSES */}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <BookOpen size={22} />
            </div>

            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              Courses
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-5">
            Total Courses
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {totalCourses}
          </h2>

        </div>

        {/* STUDENTS */}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={22} />
            </div>

            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Learners
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-5">
            Total Enrollments
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {totalStudents}
          </h2>

        </div>

        {/* EARNINGS */}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sm:col-span-2 xl:col-span-1">

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={22} />
            </div>

            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Revenue
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-5">
            Total Earnings
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {currency}
            {Math.floor(
              totalEarnings
            ).toLocaleString()}
          </h2>

        </div>

      </div>

      {/* ===================================== */}
      {/* SEARCH + FILTER */}
      {/* ===================================== */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">

          {/* SEARCH */}

          <div className="relative w-full md:max-w-md">

            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 text-sm transition"
            />

          </div>

          {/* SORT */}

          <div className="flex items-center gap-2">

            <div className="hidden sm:flex items-center gap-2 text-gray-500 text-sm">

              <SlidersHorizontal size={16} />

              Sort by

            </div>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
            >

              <option value="latest">
                Latest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="students">
                Most Students
              </option>

              <option value="earnings">
                Highest Earnings
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* ===================================== */}
      {/* COURSE LIST */}
      {/* ===================================== */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between">

          <div>

            <h2 className="font-bold text-gray-900">
              All Courses
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {filteredCourses.length} course
              {filteredCourses.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">

            <GraduationCap size={20} />

          </div>

        </div>

        {/* DESKTOP TABLE */}

        <div className="hidden lg:block overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-gray-50/70 text-left">

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Course
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Students
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Published
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Exam
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredCourses.map(
                (course) => {

                  const students =
                    course.enrolledStudents
                      ?.length || 0;

                  const price =
                    course.coursePrice -
                    (course.discount *
                      course.coursePrice) /
                      100;

                  const earnings =
                    students * price;

                  return (
                    <tr
                      key={course._id}
                      className="border-t border-gray-100 hover:bg-orange-50/30 transition-colors"
                    >

                      {/* COURSE */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-4 min-w-[280px]">

                          <img
                            src={
                              course.courseThumbnail
                            }
                            alt={
                              course.courseTitle
                            }
                            className="w-16 h-11 object-cover rounded-lg shadow-sm"
                          />

                          <div className="min-w-0">

                            <p className="font-semibold text-gray-800 truncate max-w-[280px]">

                              {
                                course.courseTitle
                              }

                            </p>

                            <p className="text-xs text-gray-400 mt-1">

                              {currency}
                              {Math.floor(
                                price
                              ).toLocaleString()}{" "}
                              per enrollment

                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EARNINGS */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">

                            <Wallet size={15} />

                          </div>

                          <span className="font-semibold text-gray-800">

                            {currency}
                            {Math.floor(
                              earnings
                            ).toLocaleString()}

                          </span>

                        </div>

                      </td>

                      {/* STUDENTS */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">

                            <Users size={15} />

                          </div>

                          <span className="font-medium text-gray-700">
                            {students}
                          </span>

                        </div>

                      </td>

                      {/* DATE */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <CalendarDays
                            size={16}
                            className="text-gray-400"
                          />

                          {new Date(
                            course.createdAt
                          ).toLocaleDateString()}

                        </div>

                      </td>

                      {/* EXAM */}

                      <td className="px-6 py-4 text-right">

                        <button
                          onClick={() =>
                            navigate(
                              `/educator/course/${course._id}/exam`
                            )
                          }
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5"
                        >

                          <ClipboardCheck
                            size={16}
                          />

                          Manage Exam

                          <ChevronRight
                            size={15}
                          />

                        </button>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

        {/* ================================= */}
        {/* MOBILE / TABLET CARDS */}
        {/* ================================= */}

        <div className="lg:hidden p-4 space-y-4">

          {filteredCourses.map(
            (course) => {

              const students =
                course.enrolledStudents
                  ?.length || 0;

              const price =
                course.coursePrice -
                (course.discount *
                  course.coursePrice) /
                  100;

              const earnings =
                students * price;

              return (
                <div
                  key={course._id}
                  className="border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-sm transition-all"
                >

                  <div className="flex gap-4">

                    <img
                      src={
                        course.courseThumbnail
                      }
                      alt={
                        course.courseTitle
                      }
                      className="w-20 h-14 object-cover rounded-xl shrink-0"
                    />

                    <div className="min-w-0">

                      <h3 className="font-semibold text-gray-800 truncate">
                        {
                          course.courseTitle
                        }
                      </h3>

                      <p className="text-xs text-gray-400 mt-1">

                        Published{" "}

                        {new Date(
                          course.createdAt
                        ).toLocaleDateString()}

                      </p>

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">

                    <div className="rounded-xl bg-gray-50 p-3">

                      <div className="flex items-center gap-2 text-gray-400 text-xs">

                        <Users size={14} />

                        Students

                      </div>

                      <p className="font-bold text-gray-800 mt-1">
                        {students}
                      </p>

                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">

                      <div className="flex items-center gap-2 text-gray-400 text-xs">

                        <Wallet size={14} />

                        Earnings

                      </div>

                      <p className="font-bold text-gray-800 mt-1">

                        {currency}
                        {Math.floor(
                          earnings
                        ).toLocaleString()}

                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/educator/course/${course._id}/exam`
                      )
                    }
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
                  >

                    <ClipboardCheck
                      size={16}
                    />

                    Manage Exam

                    <ChevronRight
                      size={15}
                    />

                  </button>

                </div>
              );
            }
          )}

        </div>

        {/* ================================= */}
        {/* EMPTY SEARCH RESULT */}
        {/* ================================= */}

        {filteredCourses.length === 0 && (

          <div className="py-16 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">

              <BookOpen size={26} />

            </div>

            <h3 className="mt-4 font-semibold text-gray-700">
              No courses found
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Try changing your search.
            </p>

          </div>

        )}

      </div>

    </div>
  );
};

export default MyCourse;