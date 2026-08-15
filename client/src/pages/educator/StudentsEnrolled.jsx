import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";

import axios from "axios";
import { toast } from "react-toastify";

import {
  Users,
  Search,
  BookOpen,
  CalendarDays,
  GraduationCap,
  UserRound,
  UserCheck,
  ChevronDown,
  X,
} from "lucide-react";

const StudentsEnrolled = () => {
  const {
    backendUrl,
    getToken,
    isEducator,
  } = useContext(AppContext);

  const [enrolledStudents, setEnrolledStudents] =
    useState(null);

  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] =
    useState("all");

  // ==========================================
  // FETCH STUDENTS
  // ==========================================

  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(
        `${backendUrl}/api/educator/enrolled-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setEnrolledStudents(
          [...data.enrolledStudents].reverse()
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(
        "Fetch enrolled students error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load students"
      );
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchEnrolledStudents();
    }
  }, [isEducator]);

  // ==========================================
  // COURSE LIST
  // ==========================================

  const courses = useMemo(() => {
    if (!enrolledStudents) return [];

    return [
      ...new Set(
        enrolledStudents
          .map((student) => student.courseTitle)
          .filter(Boolean)
      ),
    ];
  }, [enrolledStudents]);

  // ==========================================
  // FILTER STUDENTS
  // ==========================================

  const filteredStudents = useMemo(() => {
    if (!enrolledStudents) return [];

    const query = search
      .trim()
      .toLowerCase();

    return enrolledStudents.filter((student) => {
      const studentName =
        student.student?.name?.toLowerCase() || "";

      const courseTitle =
        student.courseTitle?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        studentName.includes(query) ||
        courseTitle.includes(query);

      const matchesCourse =
        selectedCourse === "all" ||
        student.courseTitle === selectedCourse;

      return (
        matchesSearch &&
        matchesCourse
      );
    });
  }, [
    enrolledStudents,
    search,
    selectedCourse,
  ]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalEnrollments =
    enrolledStudents?.length || 0;

  const uniqueStudents = useMemo(() => {
    if (!enrolledStudents) return 0;

    return new Set(
      enrolledStudents.map(
        (item) => item.student?._id
      )
    ).size;
  }, [enrolledStudents]);

  const totalCourses = courses.length;

  const latestEnrollment =
    enrolledStudents?.[0]?.purchaseDate
      ? new Date(
          enrolledStudents[0].purchaseDate
        ).toLocaleDateString()
      : "-";

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearch("");
    setSelectedCourse("all");
  };

  const hasFilters =
    search.trim() ||
    selectedCourse !== "all";

  // ==========================================
  // LOADING
  // ==========================================

  if (!enrolledStudents) {
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

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

        <div>

          <div className="flex items-center gap-2 text-orange-500 text-sm font-medium mb-1">

            <GraduationCap size={16} />

            Student Management

          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Students Enrolled
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            View and manage students enrolled in
            your courses.
          </p>

        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm">

            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">

              <Users size={17} />

            </div>

            <div>

              <p className="text-xs text-gray-400">
                Enrollments
              </p>

              <p className="font-bold text-gray-800">
                {totalEnrollments}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ===================================== */}
      {/* STAT CARDS */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">

        {/* UNIQUE STUDENTS */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

              <UserRound size={22} />

            </div>

            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Learners
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-5">
            Unique Students
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {uniqueStudents}
          </h2>

        </div>

        {/* ENROLLMENTS */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">

              <UserCheck size={22} />

            </div>

            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              Total
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-5">
            Total Enrollments
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {totalEnrollments}
          </h2>

        </div>

        {/* COURSES */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

              <BookOpen size={22} />

            </div>

            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Courses
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-5">
            Courses With Students
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {totalCourses}
          </h2>

        </div>

        {/* LATEST */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">

              <CalendarDays size={22} />

            </div>

            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              Latest
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-5">
            Latest Enrollment
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-2">
            {latestEnrollment}
          </h2>

        </div>

      </div>

      {/* ===================================== */}
      {/* SEARCH + FILTER */}
      {/* ===================================== */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">

        <div className="flex flex-col md:flex-row gap-3">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by student or course..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 text-sm transition"
            />

          </div>

          {/* COURSE FILTER */}

          <div className="relative">

            <select
              value={selectedCourse}
              onChange={(e) =>
                setSelectedCourse(
                  e.target.value
                )
              }
              className="appearance-none w-full md:w-64 h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
            >

              <option value="all">
                All Courses
              </option>

              {courses.map((course) => (
                <option
                  key={course}
                  value={course}
                >
                  {course}
                </option>
              ))}

            </select>

            <ChevronDown
              size={17}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

          </div>

          {/* CLEAR */}

          {hasFilters && (

            <button
              onClick={clearFilters}
              className="h-11 px-4 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2 transition"
            >

              <X size={16} />

              Clear

            </button>

          )}

        </div>

      </div>

      {/* ===================================== */}
      {/* STUDENT TABLE */}
      {/* ===================================== */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* TABLE HEADER */}

        <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between">

          <div>

            <h2 className="font-bold text-gray-900">
              Enrollment Records
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Showing {filteredStudents.length} of{" "}
              {totalEnrollments} enrollments
            </p>

          </div>

          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">

            <Users size={20} />

          </div>

        </div>

        {/* ================================= */}
        {/* DESKTOP TABLE */}
        {/* ================================= */}

        <div className="hidden md:block overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-gray-50/70 text-left">

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                  #
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Student
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Course
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Enrollment Date
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.map(
                (student, index) => (

                  <tr
                    key={`${student.student?._id}-${student.purchaseDate}-${index}`}
                    className="border-t border-gray-100 hover:bg-orange-50/30 transition-colors"
                  >

                    {/* NUMBER */}

                    <td className="px-6 py-4">

                      <span className="text-sm text-gray-400 font-medium">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                    </td>

                    {/* STUDENT */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <img
                          src={
                            student.student
                              ?.imageUrl
                          }
                          alt={
                            student.student
                              ?.name ||
                            "Student"
                          }
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />

                        <div>

                          <p className="font-semibold text-gray-800">
                            {
                              student
                                .student
                                ?.name
                            }
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5">
                            Student
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* COURSE */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">

                          <BookOpen size={17} />

                        </div>

                        <span className="text-sm font-medium text-gray-700 max-w-[300px] truncate">
                          {
                            student.courseTitle
                          }
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
                          student.purchaseDate
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        {/* ================================= */}
        {/* MOBILE CARDS */}
        {/* ================================= */}

        <div className="md:hidden p-4 space-y-3">

          {filteredStudents.map(
            (student, index) => (

              <div
                key={`${student.student?._id}-${student.purchaseDate}-${index}`}
                className="border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-sm transition-all"
              >

                <div className="flex items-center gap-3">

                  <img
                    src={
                      student.student
                        ?.imageUrl
                    }
                    alt={
                      student.student?.name ||
                      "Student"
                    }
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                  />

                  <div className="flex-1 min-w-0">

                    <h3 className="font-semibold text-gray-800 truncate">

                      {
                        student.student
                          ?.name
                      }

                    </h3>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Student #{index + 1}
                    </p>

                  </div>

                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-50">

                  <div className="flex items-center gap-2">

                    <BookOpen
                      size={15}
                      className="text-orange-500"
                    />

                    <span className="text-sm text-gray-700 font-medium truncate">
                      {
                        student.courseTitle
                      }
                    </span>

                  </div>

                  <div className="flex items-center gap-2 mt-2">

                    <CalendarDays
                      size={15}
                      className="text-gray-400"
                    />

                    <span className="text-xs text-gray-500">

                      Enrolled on{" "}

                      {new Date(
                        student.purchaseDate
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}

                    </span>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

        {/* ================================= */}
        {/* EMPTY STATE */}
        {/* ================================= */}

        {filteredStudents.length === 0 && (

          <div className="py-16 px-5 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">

              <Users size={26} />

            </div>

            <h3 className="mt-4 font-semibold text-gray-700">
              No students found
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Try changing your search or course
              filter.
            </p>

            {hasFilters && (

              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 text-sm font-medium transition"
              >
                Clear Filters
              </button>

            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default StudentsEnrolled;