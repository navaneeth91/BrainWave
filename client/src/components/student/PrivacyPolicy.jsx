import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const PrivacyPolicy = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const sections = [
    {
      number: "01",
      title: "Information We Collect",
      content:
        "We may collect personal details such as your name, email address, phone number, and profile information when you sign up or interact with our services. Additionally, we collect usage data to improve user experience, such as course progress, interactions, and feedback.",
    },
    {
      number: "02",
      title: "How We Use Your Information",
      content:
        "The data collected is used to provide and improve our services, personalize learning experiences, send important updates, and ensure platform security.",
    },
    {
      number: "03",
      title: "Sharing of Information",
      content:
        "We do not sell or rent your personal data. Information may only be shared with trusted service providers, academic partners, or when required by law.",
    },
    {
      number: "04",
      title: "Data Security",
      content:
        "We implement industry-standard security measures to protect your personal data. However, no online system can be guaranteed 100% secure, and you share information at your own risk.",
    },
    {
      number: "05",
      title: "Your Rights",
      content:
        "You may request access, correction, or deletion of your personal data at any time. For account-related requests, please contact our support team.",
    },
    {
      number: "06",
      title: "Updates to This Policy",
      content:
        "We may update this Privacy Policy occasionally. Any changes will be posted here, and significant updates will be communicated to you directly.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-gray-50 text-gray-900 overflow-hidden">

      {/* Background decorations */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[45%] -left-40 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* ================= HEADER ================= */}
      <section className="relative px-6 md:px-10 lg:px-16 pt-16 md:pt-24 pb-14">

        <div
          className="max-w-4xl mx-auto text-center"
          data-aos="fade-down"
        >

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm mb-6">
            <span className="text-orange-500">🔒</span>

            <span className="text-sm font-semibold text-gray-700">
              Your Privacy Matters
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            Privacy{" "}
            <span className="text-orange-600">
              Policy
            </span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-gray-500 leading-8 max-w-2xl mx-auto">
            Your privacy is important to us. This Privacy Policy explains how
            BrainWave collects, uses, and protects your personal information
            when you use our platform.
          </p>

          {/* Last updated */}
          <div className="flex justify-center mt-6">
            <span className="px-4 py-2 rounded-lg bg-gray-100 text-xs font-medium text-gray-500">
              Please review this policy carefully
            </span>
          </div>

        </div>

      </section>

      {/* ================= CONTENT ================= */}
      <section className="relative px-6 md:px-10 lg:px-16 pb-20">

        <div className="max-w-4xl mx-auto">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            {sections.map((section, index) => (

              <article
                key={section.number}
                className={`p-7 sm:p-9 md:p-10 ${
                  index !== sections.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
              >

                <div className="flex gap-5 sm:gap-7">

                  {/* Number */}
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-orange-50 text-orange-600 items-center justify-center font-bold text-sm">
                    {section.number}
                  </div>

                  {/* Content */}
                  <div>

                    <div className="flex items-center gap-3">

                      <div className="sm:hidden w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                        {section.number}
                      </div>

                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {section.title}
                      </h2>

                    </div>

                    <p className="mt-4 text-sm md:text-[15px] text-gray-500 leading-7">
                      {section.content}
                    </p>

                  </div>

                </div>

              </article>

            ))}

          </div>

        </div>

      </section>

      {/* ================= CONTACT ================= */}
      <section className="px-6 md:px-10 lg:px-16 pb-20">

        <div
          className="max-w-4xl mx-auto bg-gray-950 rounded-3xl p-8 md:p-10 text-center"
          data-aos="zoom-in"
        >

          <div className="w-12 h-12 mx-auto rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center text-xl">
            ✉
          </div>

          <h2 className="mt-5 text-2xl md:text-3xl font-bold text-white">
            Have questions about your privacy?
          </h2>

          <p className="mt-3 text-sm md:text-base text-gray-400">
            If you have any questions about this Privacy Policy,
            please contact our support team.
          </p>

          <a
            href="mailto:help.brainwave@gmail.com"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all duration-200 hover:-translate-y-0.5"
          >
            help.brainwave@gmail.com
          </a>

        </div>

      </section>

    </main>
  );
};

export default PrivacyPolicy;