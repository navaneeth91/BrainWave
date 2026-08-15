import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { assets } from "../../assets/assets";

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const features = [
    {
      icon: "▶",
      title: "Interactive Lectures",
      desc: "Video lessons, quizzes, and hands-on learning experiences.",
    },
    {
      icon: "↗",
      title: "Progress Tracking",
      desc: "Track your learning journey and monitor your progress.",
    },
    {
      icon: "🎓",
      title: "Certificates",
      desc: "Earn certificates when you successfully complete courses.",
    },
    {
      icon: "⚙",
      title: "Teacher Tools",
      desc: "Powerful tools for educators to create and manage courses.",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative">

        {/* Background decoration */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute top-72 -left-40 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-16 md:pt-24 pb-20">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Hero content */}
            <div data-aos="fade-right">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm mb-6">
                <span className="text-orange-500">✦</span>

                <span className="text-sm font-semibold text-gray-700">
                  About BrainWave
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-gray-900">

                Learn.
                <br />

                <span className="text-orange-600">
                  Build.
                </span>{" "}
                Grow.

              </h1>

              <p className="mt-6 text-base md:text-lg text-gray-500 leading-8 max-w-xl">
                BrainWave is an online learning platform built for students
                and educators. Learn hands-on, publish courses, track your
                progress, and build skills that matter.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">

                <button
                  onClick={() => navigate("/course-list")}
                  className="px-7 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-600/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Explore Courses
                </button>

                <button
                  onClick={() => navigate("/educator/add-course")}
                  className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 hover:border-orange-400 hover:text-orange-600 text-gray-700 font-semibold transition-all duration-200"
                >
                  Create a Course
                </button>

              </div>

              {/* Mini stats */}
              <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-gray-200">

                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    120+
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Courses
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    100K+
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Learners
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    4.8★
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Average rating
                  </p>
                </div>

              </div>

            </div>

            {/* Hero illustration */}
            <div
              className="relative"
              data-aos="fade-left"
            >

              <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl p-5 md:p-7">

                <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-600 rounded-2xl rotate-6 opacity-90" />

                <div className="relative bg-orange-50 rounded-2xl overflow-hidden">

                  <img
                    src={assets.about_illustration}
                    alt="BrainWave learning illustration"
                    className="w-full object-cover"
                  />

                </div>

                {/* Floating rating card */}
                <div className="absolute -bottom-6 -left-5 sm:left-5 bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      ★
                    </div>

                    <div>
                      <p className="font-bold text-gray-900">
                        4.8 / 5
                      </p>

                      <p className="text-xs text-gray-500">
                        Learner rating
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}
      <section className="bg-white py-20 md:py-24">

        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Mission */}
            <div
              className="lg:col-span-2 bg-gray-950 rounded-3xl p-8 md:p-10 text-white"
              data-aos="fade-up"
            >

              <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center text-orange-400 text-xl">
                ✦
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mt-6">
                Our Mission
              </h2>

              <p className="mt-4 text-gray-400 leading-7 max-w-2xl">
                To democratize technical education by giving creators
                easy tools to build courses and learners clear paths
                to skill mastery.
              </p>

            </div>

            {/* Who it's for */}
            <div
              className="bg-orange-50 rounded-3xl p-8 border border-orange-100"
              data-aos="fade-up"
              data-aos-delay="150"
            >

              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white text-xl">
                👥
              </div>

              <h2 className="text-xl font-bold mt-6">
                Who It's For
              </h2>

              <p className="mt-4 text-sm text-gray-600 leading-7">
                Beginners, university students, bootcamp learners,
                and working developers who want to upskill quickly
                and build real projects.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}
      <section className="py-20 md:py-24">

        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

          <div
            className="text-center max-w-2xl mx-auto"
            data-aos="fade-up"
          >

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
              <span className="text-orange-500">✦</span>

              <span className="text-sm font-semibold text-gray-700">
                What We Value
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mt-5">
              Learning that actually{" "}
              <span className="text-orange-600">
                moves you forward
              </span>
            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">

            {/* Clarity */}
            <div
              className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              data-aos="zoom-in"
            >

              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                01
              </div>

              <h3 className="text-xl font-bold mt-6">
                Clarity
              </h3>

              <p className="mt-3 text-sm text-gray-500 leading-6">
                Practical lessons that focus on understanding
                concepts and learning by doing.
              </p>

            </div>

            {/* Access */}
            <div
              className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              data-aos="zoom-in"
              data-aos-delay="150"
            >

              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                02
              </div>

              <h3 className="text-xl font-bold mt-6">
                Access
              </h3>

              <p className="mt-3 text-sm text-gray-500 leading-6">
                Simple tools for discovering, learning, and
                publishing courses without unnecessary friction.
              </p>

            </div>

            {/* Progress */}
            <div
              className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              data-aos="zoom-in"
              data-aos-delay="300"
            >

              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                03
              </div>

              <h3 className="text-xl font-bold mt-6">
                Progress
              </h3>

              <p className="mt-3 text-sm text-gray-500 leading-6">
                Measurable outcomes, progress tracking,
                certificates, and real-world projects.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="bg-white py-20 md:py-24">

        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

          <div className="text-center" data-aos="fade-up">

            <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest">
              Platform
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Everything you need to learn
            </h2>

            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Tools designed to make learning and teaching simpler,
              more engaging, and more measurable.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">

            {features.map((feature, index) => (

              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >

                <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>

                <h3 className="mt-5 font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500 leading-6">
                  {feature.desc}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          TEAM / COMMUNITY
      ===================================================== */}
      <section className="py-20 md:py-24">

        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

          <div className="grid lg:grid-cols-5 gap-6">

            {/* Team */}
            <div
              className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10"
              data-aos="fade-right"
            >

              <div className="w-12 h-12 rounded-xl bg-gray-950 text-white flex items-center justify-center">
                ♥
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mt-6">
                Built for learners, by people who care about learning.
              </h2>

              <p className="mt-4 text-gray-500 leading-7">
                A focused team of educators, designers, and engineers
                building tools that help students learn effectively
                while allowing instructors to focus on teaching.
              </p>

              <div className="grid grid-cols-3 gap-5 mt-10 pt-8 border-t border-gray-100">

                <div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    120+
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Courses
                  </p>
                </div>

                <div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    100K+
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Students
                  </p>
                </div>

                <div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    4.8★
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Rating
                  </p>
                </div>

              </div>

            </div>

            {/* Community */}
            <div
              className="lg:col-span-2 bg-gray-950 rounded-3xl p-8 md:p-10 text-white"
              data-aos="fade-left"
            >

              <div className="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                ✉
              </div>

              <h2 className="text-2xl font-bold mt-6">
                Join our community
              </h2>

              <p className="mt-3 text-sm text-gray-400 leading-6">
                Get updates, course launches, and learning
                opportunities delivered to your inbox.
              </p>

              <form
                className="mt-7"
                onSubmit={(e) => e.preventDefault()}
              >

                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-orange-500 transition"
                />

                <button
                  type="submit"
                  className="w-full mt-3 h-11 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
                >
                  Subscribe
                </button>

              </form>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="px-6 md:px-10 lg:px-16 pb-20">

        <div
          className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl bg-orange-600 px-7 sm:px-10 md:px-16 py-14 md:py-16 text-center"
          data-aos="zoom-in"
        >

          <div className="absolute -top-32 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />

          <div className="relative">

            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to start learning?
            </h2>

            <p className="mt-4 text-orange-100 max-w-xl mx-auto">
              Explore courses, build new skills, and take the next
              step in your learning journey with BrainWave.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

              <button
                onClick={() => navigate("/course-list")}
                className="px-7 py-3.5 rounded-xl bg-white text-orange-600 font-semibold hover:bg-gray-100 transition"
              >
                Explore Courses
              </button>

              <button
                onClick={() => navigate("/contact")}
                className="px-7 py-3.5 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10 transition"
              >
                Contact Us
              </button>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
};

export default About;