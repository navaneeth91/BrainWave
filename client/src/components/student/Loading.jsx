import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Loading = () => {
  const { path } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (path) {
      const timer = setTimeout(() => {
        navigate("/" + path);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [path, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-6">

      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-100/40 rounded-full blur-3xl" />

      <div className="relative flex flex-col items-center">

        {/* Loader */}
        <div className="relative w-24 h-24">

          {/* Outer ring */}
          <div
            className="
              absolute inset-0
              rounded-full
              border-4
              border-orange-100
            "
          />

          {/* Animated ring */}
          <div
            className="
              absolute inset-0
              rounded-full
              border-4
              border-orange-500
              border-t-transparent
              animate-spin
            "
          />

          {/* Inner ring */}
          <div
            className="
              absolute inset-3
              rounded-full
              border-2
              border-orange-200
              border-b-transparent
              animate-spin
            "
            style={{
              animationDuration: "1.2s",
              animationDirection: "reverse",
            }}
          />

          {/* BrainWave center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 animate-pulse">
              <span className="text-white font-bold text-lg">
                B
              </span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="mt-7 text-center">

          <h2 className="text-xl font-bold text-gray-800">
            BrainWave
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Preparing your learning experience
          </p>

          {/* Loading dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            <span
              className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Loading;