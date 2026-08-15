import React, { useEffect, useState, useContext, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";
import signature from "../../assets/ceo-signature.png";
import logo from "../../assets/logo.png";

const Certificate = () => {
  const { certificateId, courseId } = useParams();

  const { backendUrl, getToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  const certificateRef = useRef(null);

  /* =========================
     DOWNLOAD CERTIFICATE
  ========================= */

  const downloadCertificate = async () => {
    if (!certificateRef.current) {
      toast.error("Certificate is not ready");
      return;
    }

    try {
      toast.info("Preparing your certificate...");

      const certificateElement = certificateRef.current;

      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        297,
        210
      );

      pdf.save(
        `BrainWave-Certificate-${certificate.certificateId}.pdf`
      );

      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Certificate download error:", error);
      toast.error("Failed to download certificate");
    }
  };

  /* =========================
     FETCH CERTIFICATE
  ========================= */

  const fetchCertificate = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      let url;

      if (certificateId) {
        url = `${backendUrl}/api/user/certificate/${certificateId}`;
      } else if (courseId) {
        url = `${backendUrl}/api/user/certificate/course/${courseId}`;
      }

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setCertificate(data.certificate);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Certificate fetch error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load certificate"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("download") === "true") {
      setAutoDownload(true);
    }

    fetchCertificate();
  }, [certificateId, courseId]);

  /* =========================
     AUTO DOWNLOAD
  ========================= */

  useEffect(() => {
    if (!loading && certificate && autoDownload) {
      const timer = setTimeout(() => {
        downloadCertificate();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading, certificate, autoDownload]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <Loading />;
  }

  /* =========================
     CERTIFICATE NOT FOUND
  ========================= */

  if (!certificate) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-100 flex items-center justify-center px-6">

          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-10 text-center">

            <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-4xl mb-6">
              🎓
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Certificate Not Found
            </h2>

            <p className="text-gray-500 mt-3 leading-relaxed">
              We could not find a certificate associated
              with this course.
            </p>

            <button
              onClick={() => navigate("/my-enrollments")}
              className="mt-7 px-7 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
            >
              ← Back to My Enrollments
            </button>

          </div>

        </div>

        <Footer />
      </>
    );
  }

  const issuedDate = new Date(
    certificate.issuedAt
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-100 py-8 sm:py-12 px-4">

        {/* =====================================
            PAGE HEADER / ACTIONS
        ====================================== */}

        <div className="max-w-7xl mx-auto mb-8">

          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

            <div>
              <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest">
                BrainWave Achievement
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Your Certificate
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Congratulations on successfully completing your course.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">

              <button
                onClick={() => navigate("/my-enrollments")}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition shadow-sm"
              >
                ← Enrollments
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/verify-certificate/${certificate.certificateId}`
                  )
                }
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                ✓ Verify
              </button>

              <button
                onClick={downloadCertificate}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition shadow-lg shadow-orange-200"
              >
                ↓ Download
              </button>

            </div>

          </div>
        </div>

        {/* =====================================
            CERTIFICATE
        ====================================== */}

        <div
          ref={certificateRef}
          className="max-w-7xl mx-auto bg-white relative overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.12)]"
        >

          {/* Outer Premium Border */}

          <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900">

            {/* Gold Border */}

            <div className="p-[3px] bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-400">

              {/* Inner Certificate */}

              <div className="relative bg-white overflow-hidden">

                {/* =====================================
                    DECORATIVE BACKGROUND
                ====================================== */}

                <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-orange-100/60" />

                <div className="absolute -bottom-40 -right-32 w-80 h-80 rounded-full bg-orange-100/60" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.025] pointer-events-none">

                  <div className="text-[180px] font-black tracking-widest text-gray-900">
                    BW
                  </div>

                </div>

                {/* =====================================
                    CORNER DECORATIONS
                ====================================== */}

                <div className="absolute top-5 left-5 w-16 h-16 border-t-[3px] border-l-[3px] border-orange-500" />

                <div className="absolute top-5 right-5 w-16 h-16 border-t-[3px] border-r-[3px] border-orange-500" />

                <div className="absolute bottom-5 left-5 w-16 h-16 border-b-[3px] border-l-[3px] border-orange-500" />

                <div className="absolute bottom-5 right-5 w-16 h-16 border-b-[3px] border-r-[3px] border-orange-500" />

                {/* =====================================
                    CONTENT
                ====================================== */}

                <div className="relative px-6 sm:px-12 md:px-20 lg:px-24 py-10 sm:py-14 md:py-16 text-center">

                  {/* LOGO */}

                  <div className="flex flex-col items-center">

                    <div className="bg-white rounded-xl px-5 py-2">

                      <img
                        src={logo}
                        alt="BrainWave"
                        className="h-14 sm:h-16 md:h-20 w-auto object-contain"
                      />

                    </div>

                    <div className="flex items-center gap-3 mt-3">

                      <div className="w-10 sm:w-16 h-px bg-orange-400" />

                      <div className="w-2 h-2 rounded-full bg-orange-500" />

                      <div className="w-10 sm:w-16 h-px bg-orange-400" />

                    </div>

                  </div>

                  {/* TITLE */}

                  <div className="mt-6">

                    <p className="text-xs sm:text-sm font-semibold tracking-[0.4em] text-gray-400 uppercase">
                      Official Achievement
                    </p>

                    <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-wide text-gray-900">
                      CERTIFICATE
                    </h2>

                    <h3 className="mt-2 text-lg sm:text-xl md:text-2xl tracking-[0.35em] text-orange-600 font-semibold">
                      OF COMPLETION
                    </h3>

                  </div>

                  {/* PRESENTED TO */}

                  <p className="mt-8 sm:mt-10 text-gray-500 text-sm sm:text-base">
                    This certificate is proudly presented to
                  </p>

                  {/* STUDENT */}

                  <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 break-words">
                    {certificate.studentName
                      .charAt(0)
                      .toUpperCase() +
                      certificate.studentName.slice(1)}
                  </h1>

                  <div className="w-2/3 sm:w-1/2 mx-auto mt-4 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent" />

                  {/* COURSE */}

                  <p className="mt-7 text-gray-500 text-sm sm:text-base">
                    In recognition of successfully completing the course
                  </p>

                  <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-orange-600 max-w-4xl mx-auto leading-snug">
                    {certificate.courseTitle}
                  </h2>

                  <p className="mt-5 max-w-3xl mx-auto text-gray-500 text-sm sm:text-base md:text-lg leading-relaxed">
                    This certificate recognizes the dedication,
                    commitment, and successful completion of all
                    required course content through BrainWave.
                  </p>

                  {/* =====================================
                      BOTTOM DETAILS
                  ====================================== */}

                  <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-end">

                    {/* DATE */}

                    <div className="text-center">

                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {issuedDate}
                      </p>

                      <div className="w-44 mx-auto border-t border-gray-300 mt-2 pt-2">

                        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                          Date of Issue
                        </p>

                      </div>

                    </div>

                    {/* SIGNATURE */}

                    <div className="text-center">

                      <div className="h-20 flex items-end justify-center">

                        <img
                          src={signature}
                          alt="CEO Signature"
                          className="max-h-16 max-w-[180px] object-contain"
                        />

                      </div>

                      <div className="w-48 mx-auto border-t border-gray-300 mt-1 pt-2">

                        <p className="font-bold text-gray-800">
                          Navaneeth Siliveri
                        </p>

                        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                          Chief Executive Officer
                        </p>

                      </div>

                    </div>

                    {/* CERTIFICATE ID */}

                    <div className="text-center">

                      <p className="font-semibold text-gray-700 text-xs sm:text-sm break-all max-w-[220px] mx-auto">
                        {certificate.certificateId}
                      </p>

                      <div className="w-44 mx-auto border-t border-gray-300 mt-2 pt-2">

                        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                          Certificate ID
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* =====================================
                      VERIFICATION
                  ====================================== */}

                  <div className="mt-10 sm:mt-12">

                    <div className="inline-flex flex-col items-center px-5 sm:px-8 py-3 rounded-xl bg-gray-50 border border-gray-200">

                      <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-[0.25em]">
                        Verification Code
                      </p>

                      <p className="text-xs sm:text-sm font-mono font-semibold tracking-[0.25em] text-gray-600 mt-1 break-all">
                        {certificate.verificationCode}
                      </p>

                    </div>

                  </div>

                  {/* FOOTER BRANDING */}

                  <div className="mt-8 flex justify-center items-center gap-2 text-xs text-gray-400">

                    <span>BrainWave</span>

                    <span>•</span>

                    <span>Learn. Grow. Achieve.</span>

                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            BELOW CERTIFICATE INFO
        ====================================== */}

        <div className="max-w-4xl mx-auto mt-8">

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl">
                  ✓
                </div>

                <div>

                  <h3 className="font-semibold text-gray-800">
                    Certificate Successfully Issued
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Your achievement has been recorded by BrainWave.
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  navigate(
                    `/verify-certificate/${certificate.certificateId}`
                  )
                }
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition"
              >
                Verify Authenticity →
              </button>

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
};

export default Certificate;