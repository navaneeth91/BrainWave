import React from "react";
import { assets, dummyTestimonial } from "../../assets/assets";

const TestmonialsSection = () => {
  return (
    <section className="relative py-20 md:py-24 px-6 md:px-10 lg:px-16 bg-gray-50 overflow-hidden">

      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="text-center max-w-2xl mx-auto">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm mb-5">
            <span className="text-orange-500">★</span>
            <span className="text-sm font-semibold text-gray-700">
              Learner Stories
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Loved by{" "}
            <span className="text-orange-600">
              learners
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed">
            Hear from our learners as they share their journeys,
            achievements, and how BrainWave has helped them grow
            their skills and confidence.
          </p>

        </div>

        {/* ================= TESTIMONIAL CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 mt-14">

          {dummyTestimonial.map((testimonial, index) => (

            <div
              key={index}
              className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >

              {/* Top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600" />

              {/* User */}
              <div className="flex items-center gap-4 px-6 pt-6">

                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-4 ring-orange-50"
                />

                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {testimonial.name}
                  </h3>

                  <p className="text-sm text-gray-500 truncate">
                    {testimonial.role}
                  </p>
                </div>

              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 px-6 mt-5">

                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={
                      i < testimonial.rating
                        ? assets.star
                        : assets.star_blank
                    }
                    alt="Star"
                    className="w-4 h-4"
                  />
                ))}

                <span className="ml-2 text-xs font-medium text-gray-400">
                  {testimonial.rating}.0
                </span>

              </div>

              {/* Feedback */}
              <div className="px-6 pt-5 pb-7">

                <div className="text-3xl text-orange-200 font-serif leading-none">
                  “
                </div>

                <p className="mt-2 text-sm md:text-[15px] text-gray-600 leading-7">
                  {testimonial.feedback}
                </p>

                <div className="mt-5 pt-4 border-t border-gray-100">

                  <span className="text-xs font-medium text-gray-400">
                    Verified learner
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
};

export default TestmonialsSection;