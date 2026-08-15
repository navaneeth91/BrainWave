import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import axios from "axios";
import { toast } from "react-toastify";

import {
  BookOpen,
  Users,
  Wallet,
  ArrowUpRight,
  GraduationCap,
  Sparkles,
  UserRound,
  ChevronRight,
  BarChart3,
} from "lucide-react";

const Dashboard = () => {
  const {
    currency,
    backendUrl,
    getToken,
    isEducator,
  } = useContext(AppContext);

  const [dashboardData, setDashboardData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get(
        `${backendUrl}/api/educator/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {
    if (isEducator) {
      fetchDashboardData();
    }
  }, [isEducator]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading || !dashboardData) {
    return <Loading />;
  }

  const totalStudents =
    dashboardData.enrolledStudentsData?.length || 0;

  const totalCourses =
    dashboardData.totalCourses || 0;

  const totalEarnings =
    dashboardData.totalEarnings || 0;

  const latestStudents =
    dashboardData.enrolledStudentsData?.slice(
      0,
      5
    ) || [];

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      <div className="p-4 sm:p-6 lg:p-8">

        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 p-6 sm:p-8 mb-7 shadow-lg">

          {/* Decorative circles */}

          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-white/10" />

          <div className="absolute right-20 -bottom-28 w-72 h-72 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <Sparkles
                  size={17}
                  className="fill-current"
                />
                Educator Dashboard
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Welcome back, Educator 👋
              </h1>

              <p className="text-white/80 mt-2 max-w-xl">
                Manage your courses, track your
                students and monitor your teaching
                performance from one place.
              </p>

            </div>

            <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">

              <GraduationCap
                size={42}
                className="text-white"
              />

            </div>

          </div>
        </div>

        {/* ================================== */}
        {/* STATISTICS */}
        {/* ================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">

          {/* STUDENTS */}

          <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

            <div className="flex items-start justify-between">

              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">

                <Users size={24} />

              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">

                <ArrowUpRight size={13} />

                Students

              </div>

            </div>

            <div className="mt-5">

              <p className="text-sm text-gray-500">
                Total Enrollments
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                {totalStudents.toLocaleString()}
              </h2>

            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">

              <UserRound size={14} />

              Students enrolled in your courses

            </div>

          </div>

          {/* COURSES */}

          <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

            <div className="flex items-start justify-between">

              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">

                <BookOpen size={24} />

              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">

                <BarChart3 size={13} />

                Courses

              </div>

            </div>

            <div className="mt-5">

              <p className="text-sm text-gray-500">
                Total Courses
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                {totalCourses.toLocaleString()}
              </h2>

            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">

              <BookOpen size={14} />

              Courses created by you

            </div>

          </div>

          {/* EARNINGS */}

          <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 sm:col-span-2 xl:col-span-1">

            <div className="flex items-start justify-between">

              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">

                <Wallet size={24} />

              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">

                Earnings

              </div>

            </div>

            <div className="mt-5">

              <p className="text-sm text-gray-500">
                Total Earnings
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-1">

                {currency}
                {Number(
                  totalEarnings
                ).toLocaleString()}

              </h2>

            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">

              <Wallet size={14} />

              Revenue generated from enrollments

            </div>

          </div>

        </div>

        {/* ================================== */}
        {/* MAIN CONTENT */}
        {/* ================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ================================= */}
          {/* LATEST ENROLLMENTS */}
          {/* ================================= */}

          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Latest Enrollments
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Recently enrolled students
                </p>

              </div>

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 text-orange-600">

                <Users size={20} />

              </div>

            </div>

            {latestStudents.length > 0 ? (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="bg-gray-50/70 text-left">

                      <th className="px-5 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        #
                      </th>

                      <th className="px-5 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Student
                      </th>

                      <th className="px-5 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Course
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {latestStudents.map(
                      (item, index) => (

                        <tr
                          key={
                            item._id ||
                            index
                          }
                          className="border-t border-gray-100 hover:bg-orange-50/30 transition-colors"
                        >

                          <td className="px-5 sm:px-6 py-4">

                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">

                              {index + 1}

                            </span>

                          </td>

                          <td className="px-5 sm:px-6 py-4">

                            <div className="flex items-center gap-3 min-w-[180px]">

                              <img
                                src={
                                  item.student
                                    ?.imageUrl
                                }
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                              />

                              <div className="min-w-0">

                                <p className="font-semibold text-gray-800 truncate">

                                  {
                                    item.student
                                      ?.name
                                  }

                                </p>

                                <p className="text-xs text-gray-400">
                                  Student
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-5 sm:px-6 py-4">

                            <div className="flex items-center gap-2 min-w-[180px]">

                              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">

                                <BookOpen
                                  size={16}
                                />

                              </div>

                              <p className="text-sm font-medium text-gray-700 truncate">

                                {
                                  item.courseTitle
                                }

                              </p>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="py-16 text-center">

                <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">

                  <Users size={26} />

                </div>

                <h3 className="mt-4 font-semibold text-gray-700">
                  No enrollments yet
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  Student enrollments will appear
                  here.
                </p>

              </div>

            )}

          </div>

          {/* ================================= */}
          {/* OVERVIEW CARD */}
          {/* ================================= */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Your Overview
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Current platform activity
                </p>

              </div>

              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">

                <BarChart3 size={20} />

              </div>

            </div>

            {/* COURSES */}

            <div className="mt-7">

              <div className="flex items-center justify-between mb-2">

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">

                    <BookOpen size={16} />

                  </div>

                  <span className="text-sm font-medium text-gray-600">
                    Courses
                  </span>

                </div>

                <span className="font-bold text-gray-900">
                  {totalCourses}
                </span>

              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{
                    width:
                      totalCourses > 0
                        ? "100%"
                        : "5%",
                  }}
                />

              </div>

            </div>

            {/* STUDENTS */}

            <div className="mt-6">

              <div className="flex items-center justify-between mb-2">

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">

                    <Users size={16} />

                  </div>

                  <span className="text-sm font-medium text-gray-600">
                    Students
                  </span>

                </div>

                <span className="font-bold text-gray-900">
                  {totalStudents}
                </span>

              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width:
                      totalStudents > 0
                        ? "100%"
                        : "5%",
                  }}
                />

              </div>

            </div>

            {/* EARNINGS */}

            <div className="mt-6">

              <div className="flex items-center justify-between mb-2">

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">

                    <Wallet size={16} />

                  </div>

                  <span className="text-sm font-medium text-gray-600">
                    Earnings
                  </span>

                </div>

                <span className="font-bold text-gray-900">
                  {currency}
                  {Number(
                    totalEarnings
                  ).toLocaleString()}
                </span>

              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width:
                      totalEarnings > 0
                        ? "100%"
                        : "5%",
                  }}
                />

              </div>

            </div>

            {/* INFO BOX */}

            <div className="mt-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-4">

              <div className="flex gap-3">

                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm shrink-0">

                  <Sparkles size={17} />

                </div>

                <div>

                  <p className="text-sm font-semibold text-gray-800">
                    Keep growing 🚀
                  </p>

                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Create engaging courses and
                    keep your students learning.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;