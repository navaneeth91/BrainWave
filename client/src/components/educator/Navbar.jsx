import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const Navbar = () => {
  const { userData } = useContext(AppContext);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-5 md:px-8 lg:px-10 py-3.5">
        <Link to="/" className="flex items-center group">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-36 md:w-44 lg:w-52 h-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-gray-400 font-medium">Welcome back</p>
            <p className="text-sm md:text-base font-semibold text-gray-800">{userData?.name || "Educator"}</p>
          </div>
          <div className="hidden sm:block h-9 w-px bg-gray-200" />
          <img
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-gray-100"
            src={userData?.imageUrl || assets.user_icon}
            alt="User"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
