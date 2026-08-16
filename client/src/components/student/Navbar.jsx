import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const {
    navigate,
    isEducator,
    backendUrl,
    setIsEducator,
    userData,
    logout,
  } = useContext(AppContext);

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }
      const { data } = await axios.post(`${backendUrl}/api/educator/update-role`, {});
      if (data.success) {
        setIsEducator(true);
        toast.success("You are now an educator");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center group shrink-0">
            <img
              src={assets.logo}
              alt="Logo"
              className="w-40 sm:w-44 lg:w-48 h-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link
              to="/"
              className={`relative text-sm font-medium transition-colors duration-200 ${isActive("/") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"}`}
            >
              Home
            </Link>

            <Link
              to="/course-list"
              className={`relative text-sm font-medium transition-colors duration-200 ${location.pathname.includes("/course-list") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"}`}
            >
              Courses
            </Link>

            {userData && (
              <>
                <Link to="/my-enrollments" className="text-sm font-medium text-gray-600 hover:text-orange-600">
                  My Learning
                </Link>
                <Link to="/my-certificates" className="text-sm font-medium text-gray-600 hover:text-orange-600">
                  Certificates
                </Link>
              </>
            )}

            <div className="h-7 w-px bg-gray-200" />

            {userData ? (
              <div className="relative">
                <button
                  onClick={() => setOpenProfile((prev) => !prev)}
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-orange-50"
                >
                  <img
                    src={userData.imageUrl || assets.user_icon}
                    alt="profile"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-100"
                  />
                  <span className="text-sm font-medium text-gray-700 max-w-[130px] truncate">
                    {userData.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {openProfile && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                    <button onClick={() => navigate("/my-enrollments")} className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50">Profile</button>
                    <button onClick={() => navigate("/my-enrollments")} className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50">My Learning</button>
                    <button onClick={() => navigate("/my-certificates")} className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50">Certificates</button>
                    <button onClick={becomeEducator} className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50">
                      {isEducator ? "Educator Dashboard" : "Become an Educator"}
                    </button>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button onClick={() => setOpenMenu((prev) => !prev)} className="md:hidden p-2 rounded-lg bg-gray-100">
            {openMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {openMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link to="/" className="block text-sm" onClick={() => setOpenMenu(false)}>Home</Link>
          <Link to="/course-list" className="block text-sm" onClick={() => setOpenMenu(false)}>Courses</Link>
          {userData ? (
            <>
              <Link to="/my-enrollments" className="block text-sm" onClick={() => setOpenMenu(false)}>My Learning</Link>
              <Link to="/my-certificates" className="block text-sm" onClick={() => setOpenMenu(false)}>Certificates</Link>
              <button onClick={becomeEducator} className="block text-sm text-left">
                {isEducator ? "Educator Dashboard" : "Become an Educator"}
              </button>
              <button onClick={logout} className="block text-sm text-left text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm" onClick={() => setOpenMenu(false)}>Login</Link>
              <Link to="/register" className="block text-sm text-orange-600 font-semibold" onClick={() => setOpenMenu(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
