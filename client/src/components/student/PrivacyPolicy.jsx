import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const PrivacyPolicy = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  return (
    <div className="flex flex-col items-center px-6 md:px-20 lg:px-40 py-16 bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* Header Section */}
      <div
        className="max-w-4xl text-center mb-12"
        data-aos="fade-up"
      >
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg text-gray-600">
          Your privacy is important to us. This Privacy Policy explains how
          Brain Wave collects, uses, and protects your personal information when
          you use our platform.
        </p>
      </div>

      {/* Policy Content */}
      <div className="max-w-4xl space-y-8 text-left">
        <section data-aos="fade-right">
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">
            We may collect personal details such as your name, email address,
            phone number, and profile information when you sign up or interact
            with our services. Additionally, we collect usage data to improve
            user experience, such as course progress, interactions, and feedback.
          </p>
        </section>

        <section data-aos="fade-left">
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed">
            The data collected is used to provide and improve our services,
            personalize learning experiences, send important updates, and ensure
            platform security.
          </p>
        </section>

        <section data-aos="fade-right">
          <h2 className="text-2xl font-semibold mb-3">3. Sharing of Information</h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell or rent your personal data. Information may only be
            shared with trusted service providers, academic partners, or when
            required by law.
          </p>
        </section>

        <section data-aos="fade-left">
          <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement industry-standard security measures to protect your
            personal data. However, no online system can be guaranteed 100%
            secure, and you share information at your own risk.
          </p>
        </section>

        <section data-aos="fade-right">
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">
            You may request access, correction, or deletion of your personal
            data at any time. For account-related requests, please contact our
            support team.
          </p>
        </section>

        <section data-aos="fade-left">
          <h2 className="text-2xl font-semibold mb-3">6. Updates to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy occasionally. Any changes will be
            posted here, and significant updates will be communicated to you
            directly.
          </p>
        </section>
      </div>

      {/* Footer Note */}
      <div className="max-w-4xl mt-12 text-center" data-aos="zoom-in">
        <p className="text-gray-600 text-sm">
          If you have any questions about this Privacy Policy, please contact us
          at <span className="text-blue-600 font-medium">help.brainwave@gmail.com</span>.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
