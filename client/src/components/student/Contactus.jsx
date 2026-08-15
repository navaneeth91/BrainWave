import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactUs = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
  };

  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden">

      {/* Background decorations */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24">

        {/* ================= HEADER ================= */}
        <div
          className="text-center max-w-2xl mx-auto"
          data-aos="fade-down"
        >

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm mb-5">
            <span className="text-orange-500">✦</span>
            <span className="text-sm font-semibold text-gray-700">
              We're here to help
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            Let's{" "}
            <span className="text-orange-600">
              connect
            </span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-gray-500 leading-relaxed">
            Have a question, suggestion, or need some help?
            Send us a message and our team will be happy to assist you.
          </p>

        </div>

        {/* ================= CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 mt-14">

          {/* ================= FORM ================= */}
          <div
            className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 md:p-10"
            data-aos="fade-right"
          >

            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">
                Send us a message
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Fill out the form below and we'll get back to you.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>

                <textarea
                  placeholder="Tell us how we can help..."
                  rows="6"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none resize-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                Send Message
              </button>

            </form>
          </div>

          {/* ================= CONTACT INFO ================= */}
          <div
            className="lg:col-span-2"
            data-aos="fade-left"
          >

            <div className="h-full bg-gray-950 rounded-2xl p-7 sm:p-8 md:p-10 text-white">

              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-600/20 text-orange-400 text-xl mb-6">
                ✉
              </div>

              <h2 className="text-2xl font-bold">
                Contact information
              </h2>

              <p className="mt-3 text-sm text-gray-400 leading-6">
                We're always happy to hear from our learners.
                Reach out to us through any of the channels below.
              </p>

              <div className="mt-9 space-y-6">

                {/* Email */}
                <div className="flex gap-4">

                  <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-white/10 text-orange-400">
                    ✉
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-gray-200 break-all">
                      help.brainwave@gmail.com
                    </p>
                  </div>

                </div>

                {/* Phone */}
                <div className="flex gap-4">

                  <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-white/10 text-orange-400">
                    ☎
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-gray-200">
                      +91 8464963186
                    </p>
                  </div>

                </div>

                {/* Address */}
                <div className="flex gap-4">

                  <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-white/10 text-orange-400">
                    📍
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Address
                    </p>

                    <p className="mt-1 text-sm text-gray-200 leading-6">
                      BrainWave Inc,
                      <br />
                      Hyderabad, India
                    </p>
                  </div>

                </div>

              </div>

              {/* Bottom message */}
              <div className="mt-12 pt-7 border-t border-white/10">

                <p className="text-sm text-gray-400">
                  We aim to respond to all enquiries as soon as possible.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactUs;