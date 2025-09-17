import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactUs = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    // Add your backend API call here
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      {/* Header */}
      <div className="text-center mb-12" data-aos="fade-down">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg">
          We’d love to hear from you. Reach out for any queries!
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Contact Form */}
        <form
          className="flex-1 bg-white p-8 rounded-xl shadow-lg space-y-6"
          onSubmit={handleSubmit}
          data-aos="fade-right"
        >
          <label className="flex flex-col text-gray-700 font-medium">
            Name
            <input
              type="text"
              placeholder="Your Name"
              required
              className="mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col text-gray-700 font-medium">
            Email
            <input
              type="email"
              placeholder="Your Email"
              required
              className="mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </label>

          <label className="flex flex-col text-gray-700 font-medium">
            Message
            <textarea
              placeholder="Your Message"
              rows="5"
              required
              className="mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </label>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-all"
          >
            Send Message
          </button>
        </form>

        {/* Contact Info */}
        <div
          className="flex-1 bg-orange-50 p-8 rounded-xl shadow-lg space-y-6"
          data-aos="fade-left"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Info</h2>
          <p className="text-gray-700">
            <strong>Email:</strong> help.brainwave@gmail.com
          </p>
          <p className="text-gray-700">
            <strong>Phone:</strong> +91 8464963186
          </p>
          <p className="text-gray-700">
            <strong>Address:</strong> Brainwave Inc,Hyderabad, India
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
