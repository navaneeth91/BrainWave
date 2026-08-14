import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import Footer from "../../components/student/Footer";

const MyCertificates = () => {
  const {
    backendUrl,
    getToken,
    navigate,
  } = useContext(AppContext);

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get(
        `${backendUrl}/api/user/certificates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setCertificates(data.certificates || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);

      toast.error(
        error.response?.data?.message ||
        "Unable to fetch certificates"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-6 md:px-20 lg:px-36 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-800">
            My Certificates
          </h1>

          <p className="text-gray-500 mt-2">
            View and access all your course completion certificates.
          </p>
        </div>

        {/* No certificates */}
        {certificates.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center shadow-sm">

            <div className="text-5xl mb-4">
              🎓
            </div>

            <h2 className="text-xl font-semibold text-gray-700">
              No Certificates Yet
            </h2>

            <p className="text-gray-500 mt-2">
              Complete a course to earn your first certificate.
            </p>

            <button
              onClick={() => navigate("/my-enrollments")}
              className="mt-6 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              My Enrollments
            </button>

          </div>
        ) : (

          /* Certificate list */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {certificates.map((certificate) => {

              const issuedDate = new Date(
                certificate.issuedAt
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={certificate._id}
                  className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >

                  {/* Course Thumbnail */}
                  {certificate.courseId?.courseThumbnail ? (
                    <img
                      src={certificate.courseId.courseThumbnail}
                      alt={certificate.courseTitle}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">
                        Certificate
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">

                    <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {certificate.courseTitle}
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                      Issued on {issuedDate}
                    </p>

                    <div className="mt-4 bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-500">
                        Certificate ID
                      </p>

                      <p className="text-sm font-mono text-gray-700 break-all mt-1">
                        {certificate.certificateId}
                      </p>

                    </div>

                    <div className="mt-5 flex gap-3">

                    <div className="mt-5 flex gap-3">

                        <button
                            onClick={() =>
                            navigate(
                                `/certificate/${certificate.certificateId}`
                            )
                            }
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                            View Certificate
                        </button>

                        <button
                            onClick={() =>
                            navigate(
                                `/certificate/${certificate.certificateId}?download=true`
                            )
                            }
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Download
                        </button>

                        </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      <Footer />
    </>
  );
};

export default MyCertificates;