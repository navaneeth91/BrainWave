import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { assets } from '../../assets/assets';

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-100 to-white text-gray-900 py-12">
      <section className="container mx-auto px-6 lg:px-20">
        {/* Header */}
        <header className="grid gap-6 lg:grid-cols-2 items-center">
          <div data-aos="fade-right">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              About <span className="text-orange-600">Brain Wave</span>
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Brain Wave is an online learning platform built for students and educators — a place to publish
              courses, learn hands-on, and measure progress. We make high-quality technical education accessible,
              interactive, and measurable.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/course-list"
                className="inline-block rounded-2xl bg-orange-600 text-white px-5 py-3 font-medium hover:bg-orange-700 transition"
                data-aos="zoom-in"
              >
                Explore Courses
              </a>
              <a
                href="/educator/add-course"
                className="inline-block rounded-2xl border border-orange-600 text-orange-600 px-5 py-3 font-medium hover:bg-orange-50 transition"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                Create a Course
              </a>
            </div>
          </div>

          <div className="relative" data-aos="fade-left">
            <div className="rounded-2xl bg-white shadow-lg p-6">
              <img
                src={assets.about_illustration}
                alt="learning illustration"
                className="w-full h-full object-cover"
                
              />
              <div className="mt-4">
                <p className="text-sm text-gray-600">Trusted by students and instructors worldwide</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="rounded-full bg-orange-100 px-3 py-2 text-orange-700 font-semibold">4.8★</div>
                  <div className="text-sm text-gray-700">100K+ students</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mission / Values */}
        <section className="mt-12 grid gap-8 lg:grid-cols-3">
          <article className="bg-white rounded-2xl p-6 shadow-sm" data-aos="flip-left">
            <h3 className="font-semibold text-xl">Our Mission</h3>
            <p className="mt-3 text-gray-600 text-sm">
              To democratize technical education by giving creators easy tools to build courses and learners clear
              paths to skill mastery.
            </p>
          </article>

          <article className="bg-white rounded-2xl p-6 shadow-sm" data-aos="flip-up" data-aos-delay="200">
            <h3 className="font-semibold text-xl">What We Value</h3>
            <ul className="mt-3 text-gray-600 text-sm list-disc pl-5 space-y-2">
              <li>Clarity: practical lessons that teach by doing.</li>
              <li>Access: low-friction publishing and discovering of courses.</li>
              <li>Progress: measurable outcomes, certificates, and projects.</li>
            </ul>
          </article>

          <article className="bg-white rounded-2xl p-6 shadow-sm" data-aos="flip-right" data-aos-delay="400">
            <h3 className="font-semibold text-xl">Who It's For</h3>
            <p className="mt-3 text-gray-600 text-sm">
              Beginners, university students, bootcamp learners, and working developers who want to upskill quickly
              and build a portfolio of real projects.
            </p>
          </article>
        </section>

        {/* Features */}
        <section className="mt-12" data-aos="fade-up">
          <h2 className="text-2xl font-semibold">Core Features</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Interactive Lectures', desc: 'Video + quizzes + code sandboxes.' },
              { title: 'Progress Tracking', desc: 'Learner dashboards and analytics.' },
              { title: 'Certificates', desc: 'Auto-generated certificates on completion.' },
              { title: 'Teacher Tools', desc: 'Upload resources, schedule assignments.' },
            ].map((f, i) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-5 shadow-sm"
                data-aos="zoom-in"
                data-aos-delay={i * 150}
              >
                <h4 className="font-semibold">{f.title}</h4>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team + Stats */}
        <section className="mt-12 grid gap-8 lg:grid-cols-3 items-center">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm" data-aos="fade-right">
            <h3 className="text-xl font-semibold">Our Team</h3>
            <p className="mt-3 text-gray-600 text-sm">
              A small, focused team of educators, designers, and engineers building tools that help students learn
              effectively and instructors focus on teaching.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center" data-aos="fade-up">
                <div className="text-2xl font-bold">120+</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
              <div className="text-center" data-aos="fade-up" data-aos-delay="150">
                <div className="text-2xl font-bold">100K+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center" data-aos="fade-up" data-aos-delay="300">
                <div className="text-2xl font-bold">4.8★</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl p-6 shadow-sm" data-aos="fade-left">
            <h4 className="font-semibold">Join Our Community</h4>
            <p className="mt-2 text-sm text-gray-600">Get updates, course launches and mentorship opportunities.</p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button className="rounded-full bg-orange-600 text-white px-4 py-2">Subscribe</button>
            </form>
          </aside>
        </section>

        {/* CTA */}
        <section className="mt-12 bg-white rounded-2xl p-8 shadow-sm text-center" data-aos="zoom-in">
          <h3 className="text-2xl font-semibold">Ready to learn or teach?</h3>
          <p className="mt-2 text-gray-600">Create a free account and start your first course on Brain Wave today.</p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="/signup" className="rounded-2xl bg-orange-600 text-white px-6 py-3 font-medium">Get Started</a>
            <a href="/contact" className="rounded-2xl border border-orange-600 text-orange-600 px-6 py-3 font-medium">Contact Us</a>
          </div>
        </section>

        {/* Footer note */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Brain Wave. All rights reserved.
        </footer>
      </section>
    </main>
  );
};

export default About;
