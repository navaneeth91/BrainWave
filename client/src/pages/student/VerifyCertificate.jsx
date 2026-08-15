import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import Loading from "../../components/student/Loading";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${backendUrl}/api/user/verify-certificate/${certificateId}`
      );

      if (data.success) {
        setCertificate(data.certificate);
      } else {
        setError(data.message || "Certificate not found");
      }
    } catch (error) {
      console.error("Certificate verification error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to verify certificate"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  if (loading) {
    return <Loading />;
  }

  const issuedDate = certificate?.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4 py-12 sm:py-16">

      {/* Decorative background */}
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 text-3xl shadow-sm mb-5">
            🎓
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Certificate Verification
          </h1>

          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Verify the authenticity of a certificate issued by
            <span className="font-semibold text-orange-600">
              {" "}BrainWave
            </span>.
          </p>

          {/* Certificate ID */}
          <div className="mt-5 inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2">
            <span className="text-xs text-gray-400">
              Certificate ID
            </span>

            <span className="text-xs sm:text-sm font-mono font-medium text-gray-700 break-all">
              {certificateId}
            </span>
          </div>

        </div>

        {/* =========================
            VALID CERTIFICATE
        ========================== */}

        {certificate ? (

          <div className="relative bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">

            {/* Top verification banner */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 sm:px-10 py-7 text-white">

              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-5">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
                    ✓
                  </div>

                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Verification Status
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-bold">
                      Certificate Verified
                    </h2>
                  </div>

                </div>

                <div className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-medium">
                  ✓ Authentic Certificate
                </div>

              </div>

            </div>

            {/* Certificate body */}
            <div className="p-6 sm:p-10">

              {/* Main certificate highlight */}
              <div className="relative rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 sm:p-8 mb-8 overflow-hidden">

                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-orange-100/70" />
                <div className="absolute -bottom-16 -left-10 w-32 h-32 rounded-full bg-orange-100/50" />

                <div className="relative text-center">

                  <p className="text-sm uppercase tracking-[0.25em] text-orange-600 font-semibold">
                    BrainWave
                  </p>

                  <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
                    Certificate of Completion
                  </h3>

                  <p className="mt-5 text-sm text-gray-500">
                    This certificate is proudly awarded to
                  </p>

                  <h4 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-800">
                    {certificate.studentName}
                  </h4>

                  <p className="mt-5 text-sm text-gray-500">
                    for successfully completing
                  </p>

                  <p className="mt-2 text-xl sm:text-2xl font-semibold text-orange-600">
                    {certificate.courseTitle}
                  </p>

                </div>

              </div>

              {/* Information cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Student */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 hover:shadow-md transition">

                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                    👤
                  </div>

                  <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                    Student
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {certificate.studentName}
                  </p>

                </div>

                {/* Course */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 hover:shadow-md transition">

                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                    📚
                  </div>

                  <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                    Course
                  </p>

                  <p className="mt-1 font-semibold text-gray-800 line-clamp-2">
                    {certificate.courseTitle}
                  </p>

                </div>

                {/* Issued Date */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 hover:shadow-md transition">

                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                    📅
                  </div>

                  <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                    Issued Date
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {issuedDate}
                  </p>

                </div>

              </div>

              {/* Verification details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Certificate ID */}
                <div className="rounded-xl border border-gray-200 p-5">

                  <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                    Certificate ID
                  </p>

                  <p className="mt-2 font-mono text-sm text-gray-700 break-all">
                    {certificate.certificateId}
                  </p>

                </div>

                {/* Verification Code */}
                <div className="rounded-xl border border-gray-200 p-5">

                  <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                    Verification Code
                  </p>

                  <p className="mt-2 font-mono font-semibold text-orange-600">
                    {certificate.verificationCode}
                  </p>

                </div>

              </div>

              {/* CEO */}
              <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                    Authorized By
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {certificate.ceoName || "Navaneeth Siliveri"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Chief Executive Officer, BrainWave
                  </p>
                </div>

                <div className="text-4xl opacity-80">
                  ✍️
                </div>

              </div>

              {/* Success message */}
              <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">

                <div className="flex gap-3">

                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold text-green-800">
                      Verification Successful
                    </h3>

                    <p className="mt-1 text-sm text-green-700 leading-relaxed">
                      This certificate has been successfully verified
                      against the BrainWave certificate database.
                      The information displayed above matches our
                      official records.
                    </p>
                  </div>

                </div>

              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">

                <button
                  onClick={() => navigate("/")}
                  className="px-7 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 hover:shadow-lg transition-all"
                >
                  Back to BrainWave
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-7 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  🖨️ Print Verification
                </button>

              </div>

            </div>

          </div>

        ) : (

          /* =========================
             INVALID CERTIFICATE
          ========================== */

          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-red-200 overflow-hidden">

            {/* Error banner */}
            <div className="bg-gradient-to-r from-red-600 to-rose-500 px-6 sm:px-10 py-8 text-center text-white">

              <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-4">
                ✕
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold">
                Certificate Not Found
              </h2>

              <p className="mt-2 text-red-100">
                We could not verify this certificate.
              </p>

            </div>

            <div className="p-6 sm:p-10 text-center">

              <p className="text-gray-600 leading-relaxed">
                The certificate ID provided does not match any
                certificate in the BrainWave database.
              </p>

              <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4 text-left">

                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                  Submitted Certificate ID
                </p>

                <p className="mt-2 font-mono text-sm text-gray-700 break-all">
                  {certificateId}
                </p>

              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-8">

                <button
                  onClick={() => navigate("/")}
                  className="px-7 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 hover:shadow-lg transition-all"
                >
                  Back to BrainWave
                </button>

              </div>

            </div>

          </div>

        )}

        {/* Footer note */}
        <div className="text-center mt-8">

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} BrainWave · Secure Certificate Verification
          </p>

        </div>

      </div>
    </div>
  );
};

export default VerifyCertificate;