import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import {
  useClerk,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const location = useLocation();

  const { openSignIn } = useClerk();
  const { user } = useUser();

  const {
    navigate,
    isEducator,
    backendUrl,
    setIsEducator,
    getToken,
  } = useContext(AppContext);

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/educator/update-role`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setIsEducator(true);
        toast.success("You are now an educator");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="h-[72px] flex items-center justify-between">

          {/* ================= LOGO ================= */}
          <Link
            to="/"
            className="flex items-center group shrink-0"
          >
            <img
              src={assets.logo}
              alt="Logo"
              className="w-40 sm:w-44 lg:w-48 h-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <div className="hidden md:flex items-center gap-7">

            {/* Home */}
            <Link
              to="/"
              className={`relative text-sm font-medium transition-colors duration-200 ${
                isActive("/")
                  ? "text-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              Home

              {isActive("/") && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-orange-500 rounded-full" />
              )}
            </Link>

            {/* Courses */}
            <Link
              to="/course-list"
              className={`relative text-sm font-medium transition-colors duration-200 ${
                location.pathname.includes("/course-list")
                  ? "text-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              Courses

              {location.pathname.includes("/course-list") && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-orange-500 rounded-full" />
              )}
            </Link>

            {user && (
              <>
                {/* My Enrollments */}
                <Link
                  to="/my-enrollments"
                  className={`relative text-sm font-medium transition-colors duration-200 ${
                    isActive("/my-enrollments")
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-orange-600"
                  }`}
                >
                  My Learning

                  {isActive("/my-enrollments") && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </Link>

                {/* Certificates */}
                <Link
                  to="/my-certificates"
                  className={`relative text-sm font-medium transition-colors duration-200 ${
                    isActive("/my-certificates")
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-orange-600"
                  }`}
                >
                  Certificates

                  {isActive("/my-certificates") && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </Link>
              </>
            )}

            {/* Divider */}
            <div className="h-7 w-px bg-gray-200" />

            {/* Educator */}
            {user && (
              <button
                onClick={becomeEducator}
                className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors duration-200"
              >
                {isEducator
                  ? "Educator Dashboard"
                  : "Become an Educator"}
              </button>
            )}

            {/* Profile / Login */}
            {user ? (
              <div className="ml-1 flex items-center justify-center rounded-full ring-2 ring-gray-100 hover:ring-orange-200 transition-all duration-200">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 lg:w-10 lg:h-10",
                    },
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => openSignIn()}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                Get Started
              </button>
            )}
          </div>

          {/* ================= MOBILE NAV ================= */}
          <div className="md:hidden flex items-center gap-3">

            {user && (
              <Link
                to="/my-enrollments"
                className="text-xs sm:text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
              >
                My Learning
              </Link>
            )}

            {user ? (
              <div className="flex items-center justify-center rounded-full ring-2 ring-gray-100">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                    },
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => openSignIn()}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 transition"
              >
                <img
                  src={assets.user_icon}
                  alt="User"
                  className="w-5 h-5"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;