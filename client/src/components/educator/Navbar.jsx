import React from "react";
import { assets } from "../../assets/assets";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-5 md:px-8 lg:px-10 py-3.5">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center group"
        >
          <img
            src={assets.logo}
            alt="Logo"
            className="w-36 md:w-44 lg:w-52 h-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-5">

          {/* Welcome Text */}
          <div className="hidden sm:block text-right">
            <p className="text-xs text-gray-400 font-medium">
              Welcome back
            </p>

            <p className="text-sm md:text-base font-semibold text-gray-800">
              {user?.fullName || "Developer"}
            </p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-9 w-px bg-gray-200" />

          {/* Profile */}
          <div className="flex items-center justify-center">
            {user ? (
              <div className="rounded-full ring-2 ring-gray-100 hover:ring-orange-200 transition-all duration-200">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 md:w-10 md:h-10",
                    },
                  }}
                />
              </div>
            ) : (
              <img
                className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-gray-100"
                src={assets.profile_img}
                alt="User"
              />
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;