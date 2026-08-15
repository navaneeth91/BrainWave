import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="px-6 md:px-10 lg:px-16 py-16 md:py-20 bg-white">

      <div className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl bg-gray-950 px-7 sm:px-10 md:px-16 py-14 md:py-20 text-center">

        {/* Background decorations */}
        <div className="absolute -top-32 -right-20 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

        {/* Decorative circles */}
        <div className="absolute top-8 left-8 w-3 h-3 rounded-full bg-orange-500/70" />
        <div className="absolute bottom-10 right-10 w-2 h-2 rounded-full bg-orange-400/50" />

        <div className="relative max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
            <span className="text-orange-400">✦</span>

            <span className="text-sm font-medium text-gray-300">
              Start your learning journey
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            Your learning journey.
            <br />

            <span className="text-orange-500">
              On your time, on your terms.
            </span>
          </h2>

          {/* Description */}
          <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-400 leading-7 max-w-2xl mx-auto">
            Explore practical courses anytime, anywhere. Learn new skills,
            track your progress, and grow at your own pace with BrainWave.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">

            <button
              onClick={() => navigate("/course-list")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-600/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              Explore Courses
            </button>

            <button
              onClick={() => navigate("/about")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold transition-all duration-200"
            >
              Learn More

              <img
                src={assets.arrow_icon}
                alt="Arrow"
                className="w-4 h-4 invert"
              />
            </button>

          </div>

          {/* Bottom features */}
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-3 mt-10 text-xs sm:text-sm text-gray-500">

            <span className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Learn at your pace
            </span>

            <span className="hidden sm:block text-gray-700">
              •
            </span>

            <span className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Practical courses
            </span>

            <span className="hidden sm:block text-gray-700">
              •
            </span>

            <span className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Earn certificates
            </span>

          </div>

        </div>

      </div>

    </section>
  );
};

export default CallToAction;