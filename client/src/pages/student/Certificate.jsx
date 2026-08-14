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

  const {
    backendUrl,
    getToken,
  } = useContext(AppContext);

  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const certificateRef = useRef(null);
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

    const pdfWidth = 297;
    const pdfHeight = 210;

    pdf.addImage(
      imageData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
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

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("download") === "true") {
    setAutoDownload(true);
  }

  fetchCertificate();
}, [certificateId, courseId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      let url;

      // If certificate ID is provided
      if (certificateId) {
        url = `${backendUrl}/api/user/certificate/${certificateId}`;
      }

      // If course ID is provided
      else if (courseId) {
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
useEffect(() => {
  if (!loading && certificate && autoDownload) {
    const timer = setTimeout(() => {
      downloadCertificate();
    }, 1000);

    return () => clearTimeout(timer);
  }
}, [loading, certificate, autoDownload]);
  if (loading) {
    return <Loading />;
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Certificate Not Found
        </h2>

        <p className="text-gray-500 mt-2">
          We could not find a certificate for this course.
        </p>

        <button
          onClick={() => navigate("/my-enrollments")}
          className="mt-6 px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Back to My Enrollments
        </button>
      </div>
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
      <div className="min-h-screen bg-gray-100 py-10 px-4">

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">

          <button
            onClick={() => navigate("/my-enrollments")}
            className="px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            ← My Enrollments
          </button>
        <button
            onClick={() =>
            navigate(`/verify-certificate/${certificate.certificateId}`)
            }
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
            Verify Certificate
        </button>
          <button
            onClick={downloadCertificate}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow"
          >
            Download Certificate
          </button>

        </div>

        {/* Certificate */}
        <div
          ref={certificateRef}
          className="max-w-6xl mx-auto bg-white relative overflow-hidden shadow-2xl"
        >

          {/* Outer Border */}
          <div className="border-[12px] border-gray-800 p-2">

            {/* Inner Border */}
            <div className="border-[3px] border-orange-500">

              <div className="relative px-10 py-12 md:px-20 md:py-16 text-center">

                {/* Decorative Corners */}
                <div className="absolute top-3 left-3 w-16 h-16 border-t-4 border-l-4 border-orange-500"></div>

                <div className="absolute top-3 right-3 w-16 h-16 border-t-4 border-r-4 border-orange-500"></div>

                <div className="absolute bottom-3 left-3 w-16 h-16 border-b-4 border-l-4 border-orange-500"></div>

                <div className="absolute bottom-3 right-3 w-16 h-16 border-b-4 border-r-4 border-orange-500"></div>

                    <div className="mb-5 flex flex-col items-center">

                    <img
                        src={logo}
                        alt="BrainWave Logo"
                        className="h-16 md:h-20 w-auto object-contain"
                    />

                    <div className="w-24 h-1 bg-orange-500 mx-auto mt-3"></div>

                    </div>


                {/* Certificate Heading */}
                <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-widest text-gray-900">
                  CERTIFICATE
                </h2>

                <h3 className="text-xl md:text-2xl tracking-[0.3em] text-orange-600 font-semibold mt-2">
                  OF COMPLETION
                </h3>


                {/* Intro */}
                <p className="mt-10 text-gray-500 text-lg">
                  This certificate is proudly presented to
                </p>


                {/* Student Name */}
                <h1 className="mt-4 text-4xl md:text-5xl font-serif font-bold text-gray-900">
                  {certificate.studentName.charAt(0).toUpperCase() + certificate.studentName.slice(1)}
                </h1>

                <div className="w-2/3 h-px bg-gray-300 mx-auto mt-4"></div>


                {/* Completion Text */}
                <p className="mt-8 text-gray-600 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                  In recognition of successfully completing the course
                </p>


                {/* Course Name */}
                <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-orange-600">
                  {certificate.courseTitle}
                </h2>


                <p className="mt-6 text-gray-500 text-base md:text-lg">
                  This certificate acknowledges the dedication,
                  commitment, and successful completion of the
                  required course content.
                </p>


                {/* Bottom Information */}
                <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 items-end">

                  {/* Issue Date */}
                  <div className="text-center">

                    <p className="text-gray-700 font-semibold">
                      {issuedDate}
                    </p>

                    <div className="border-t border-gray-400 mt-2 pt-2">
                      <p className="text-sm text-gray-500">
                        Date of Issue
                      </p>
                    </div>

                  </div>


                  {/* CEO Signature */}
                  <div className="text-center">

                    <div className="h-20 flex items-end justify-center">

                      <img
                        src={signature}
                        alt="CEO Signature"
                        className="max-h-16 max-w-[180px] object-contain"
                      />

                    </div>

                    <div className="border-t border-gray-400 mt-1 pt-2">

                      <p className="font-semibold text-gray-800">
                        Navaneeth Siliveri
                      </p>

                      <p className="text-sm text-gray-500">
                        Chief Executive Officer
                      </p>

                    </div>

                  </div>


                  {/* Certificate ID */}
                  <div className="text-center">

                    <p className="text-gray-700 font-semibold text-sm break-all">
                      {certificate.certificateId}
                    </p>

                    <div className="border-t border-gray-400 mt-2 pt-2">

                      <p className="text-sm text-gray-500">
                        Certificate ID
                      </p>

                    </div>

                  </div>

                </div>


                {/* Verification */}
                <div className="mt-10">

                  <p className="text-xs text-gray-400">
                    Verification Code
                  </p>

                  <p className="text-sm font-mono tracking-widest text-gray-600 mt-1">
                    {certificate.verificationCode}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
};

export default Certificate;