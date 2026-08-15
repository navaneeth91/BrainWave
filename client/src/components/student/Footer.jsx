import React from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white mt-20">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-14">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">

          {/* ================= BRAND ================= */}
          <div className="lg:col-span-2">

            <Link to="/" className="inline-block">
              <img
                src={assets.logo}
                alt="BrainWave"
                className="w-40 md:w-48 h-auto object-contain"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm md:text-base text-gray-400 leading-7">
              Learn anything, anytime, anywhere with BrainWave.
              Build practical skills, expand your knowledge, and
              take the next step in your learning journey.
            </p>

            {/* Small trust indicators */}
            <div className="flex flex-wrap gap-5 mt-7 text-sm text-gray-400">

              <div className="flex items-center gap-2">
                <span className="text-orange-400">✓</span>
                Practical Learning
              </div>

              <div className="flex items-center gap-2">
                <span className="text-orange-400">✓</span>
                Learn at Your Pace
              </div>

              <div className="flex items-center gap-2">
                <span className="text-orange-400">✓</span>
                Earn Certificates
              </div>

            </div>

          </div>

          {/* ================= COMPANY ================= */}
          <div>

            <h2 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Company
            </h2>

            <ul className="space-y-3 text-sm text-gray-400">

              <li>
                <Link
                  to="/"
                  className="hover:text-orange-400 transition"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="hover:text-orange-400 transition"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="hover:text-orange-400 transition"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-orange-400 transition"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/course-list"
                  className="hover:text-orange-400 transition"
                >
                  Browse Courses
                </Link>
              </li>

            </ul>

          </div>

          {/* ================= NEWSLETTER ================= */}
          <div>

            <h2 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Stay Updated
            </h2>

            <p className="text-sm text-gray-400 leading-6">
              Get the latest courses, learning resources, and
              BrainWave updates directly in your inbox.
            </p>

            <div className="mt-5 flex flex-col gap-3">

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-11 px-4 rounded-lg bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-500 transition"
              />

              <button
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition duration-200"
              >
                Subscribe
              </button>

            </div>

          </div>

        </div>

        {/* ================= DIVIDER ================= */}
        <div className="border-t border-gray-800 mt-12 pt-7">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <p className="text-xs md:text-sm text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} BrainWave. All rights reserved.
            </p>

            <div className="flex items-center gap-5 text-xs md:text-sm text-gray-500">

              <Link
                to="/privacy-policy"
                className="hover:text-gray-300 transition"
              >
                Privacy
              </Link>

              <span className="w-1 h-1 rounded-full bg-gray-700" />

              <Link
                to="/contact"
                className="hover:text-gray-300 transition"
              >
                Support
              </Link>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;