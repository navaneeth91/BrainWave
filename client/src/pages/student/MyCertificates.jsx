import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import Footer from "../../components/student/Footer";

const MyCertificates = () => {
  const { backendUrl, getToken, navigate } = useContext(AppContext);

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);

        const token = await getToken();

        if (!token) {
          toast.error("Please login to view your certificates");
          return;
        }

        const response = await axios.get(
          `${backendUrl}/api/user/certificates`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Certificate API:", response.data);

        if (response.data?.success) {
          setCertificates(response.data.certificates || []);
        } else {
          toast.error(
            response.data?.message || "Unable to fetch certificates"
          );
          setCertificates([]);
        }
      } catch (error) {
        console.error("Certificate fetch error:", error);

        toast.error(
          error.response?.data?.message ||
            "Unable to fetch certificates"
        );

        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [backendUrl, getToken]);

  /* ================= LOADING ================= */

  if (loading) {
    return <Loading />;
  }

  /* ================= PAGE ================= */

  return (
    <div className="min-h-screen bg-[#fafafa]">

      <main className="px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-10 md:py-14">

        <div className="max-w-7xl mx-auto">

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">

            <div>

              <div className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                bg-orange-50
                border
                border-orange-100
                text-orange-600
                text-xs
                font-semibold
                mb-4
              ">
                <span>🎓</span>
                Your Achievements
              </div>

              <h1 className="
                text-3xl
                sm:text-4xl
                font-bold
                tracking-tight
                text-gray-900
              ">
                My Certificates
              </h1>

              <p className="
                mt-2
                text-sm
                sm:text-base
                text-gray-500
              ">
                Your completed courses and earned certificates.
              </p>

            </div>


            {/* Certificate count */}

            <div className="
              inline-flex
              items-center
              gap-4
              self-start
              md:self-auto
              px-5
              py-3
              bg-white
              border
              border-gray-100
              rounded-2xl
              shadow-sm
            ">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-orange-50
                flex
                items-center
                justify-center
                text-xl
              ">
                🏆
              </div>

              <div>

                <p className="
                  text-[11px]
                  uppercase
                  tracking-wider
                  font-semibold
                  text-gray-400
                ">
                  Certificates
                </p>

                <p className="
                  text-xl
                  font-bold
                  text-gray-900
                ">
                  {certificates.length}
                </p>

              </div>

            </div>

          </div>


          {/* =====================================================
              EMPTY STATE
          ====================================================== */}

          {certificates.length === 0 ? (

            <div className="
              min-h-[400px]
              bg-white
              border
              border-gray-100
              rounded-3xl
              shadow-sm
              flex
              flex-col
              items-center
              justify-center
              text-center
              px-6
            ">

              <div className="
                w-20
                h-20
                rounded-2xl
                bg-orange-50
                flex
                items-center
                justify-center
                text-4xl
                mb-5
              ">
                🎓
              </div>

              <h2 className="
                text-2xl
                font-bold
                text-gray-900
              ">
                No Certificates Yet
              </h2>

              <p className="
                mt-3
                max-w-md
                text-sm
                leading-6
                text-gray-500
              ">
                Complete your courses and pass the required exams
                to earn certificates.
              </p>

              <button
                onClick={() => navigate("/my-enrollments")}
                className="
                  mt-7
                  px-6
                  py-3
                  rounded-xl
                  bg-orange-600
                  hover:bg-orange-700
                  text-white
                  text-sm
                  font-semibold
                  transition-all
                "
              >
                View My Enrollments
              </button>

            </div>

          ) : (

            /* =====================================================
                CERTIFICATE GRID
            ====================================================== */

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-6
            ">

              {certificates.map((certificate, index) => {

                /*
                 * Different certificates in your database appear
                 * to have slightly different fields.
                 * Therefore we safely check multiple locations.
                 */

                const courseTitle =
                  certificate.courseTitle ||
                  certificate.courseId?.courseTitle ||
                  "Completed Course";

                const thumbnail =
                  certificate.courseId?.courseThumbnail ||
                  certificate.courseThumbnail ||
                  "";

                const issuedDate = certificate.issuedAt
                  ? new Date(
                      certificate.issuedAt
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Date unavailable";

                return (

                  <article
                    key={certificate._id || certificate.certificateId || index}
                    className="
                      group
                      bg-white
                      border
                      border-gray-100
                      rounded-2xl
                      overflow-hidden
                      shadow-sm
                      hover:shadow-xl
                      hover:-translate-y-1
                      transition-all
                      duration-300
                    "
                  >

                    {/* =================================================
                        COURSE IMAGE
                    ================================================== */}

                    <div className="
                      relative
                      h-40
                      overflow-hidden
                      bg-gray-100
                    ">

                      {thumbnail ? (

                        <img
                          src={thumbnail}
                          alt={courseTitle}
                          className="
                            w-full
                            h-full
                            object-cover
                            group-hover:scale-105
                            transition-transform
                            duration-500
                          "
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />

                      ) : (

                        <div className="
                          w-full
                          h-full
                          bg-gradient-to-br
                          from-orange-100
                          to-orange-200
                          flex
                          items-center
                          justify-center
                        ">
                          <span className="text-5xl">
                            🎓
                          </span>
                        </div>

                      )}


                      {/* Dark overlay */}

                      <div className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/50
                        via-transparent
                        to-transparent
                      " />


                      {/* Certified badge */}

                      <div className="
                        absolute
                        top-3
                        right-3
                      ">

                        <span className="
                          inline-flex
                          items-center
                          gap-1
                          px-3
                          py-1.5
                          rounded-full
                          bg-white/95
                          text-orange-600
                          text-xs
                          font-bold
                          shadow-sm
                        ">
                          ✓ Certified
                        </span>

                      </div>

                    </div>


                    {/* =================================================
                        CONTENT
                    ================================================== */}

                    <div className="p-5">

                      {/* Course title */}

                      <h2 className="
                        text-base
                        sm:text-lg
                        font-bold
                        text-gray-900
                        leading-snug
                        line-clamp-2
                        min-h-[48px]
                      ">
                        {courseTitle}
                      </h2>


                      {/* Student */}

                      {certificate.studentName && (

                        <p className="
                          mt-2
                          text-xs
                          text-gray-400
                        ">
                          Awarded to{" "}

                          <span className="
                            font-semibold
                            text-gray-600
                          ">
                            {certificate.studentName}
                          </span>
                        </p>

                      )}


                      {/* Date */}

                      <div className="
                        flex
                        items-center
                        gap-2
                        mt-3
                        text-xs
                        text-gray-500
                      ">

                        <span>📅</span>

                        <span>
                          Issued {issuedDate}
                        </span>

                      </div>


                      {/* Certificate ID */}

                      <div className="
                        mt-4
                        px-3
                        py-3
                        rounded-xl
                        bg-gray-50
                        border
                        border-gray-100
                      ">

                        <p className="
                          text-[10px]
                          uppercase
                          tracking-wider
                          font-semibold
                          text-gray-400
                        ">
                          Certificate ID
                        </p>

                        <p className="
                          mt-1
                          text-xs
                          font-mono
                          text-gray-600
                          break-all
                        ">
                          {certificate.certificateId}
                        </p>

                      </div>


                      {/* =================================================
                          ACTIONS
                      ================================================== */}

                      <div className="
                        mt-4
                        grid
                        grid-cols-2
                        gap-2
                      ">

                        <button
                          onClick={() =>
                            navigate(
                              `/certificate/${certificate.certificateId}`
                            )
                          }
                          className="
                            px-3
                            py-2.5
                            rounded-xl
                            bg-orange-600
                            hover:bg-orange-700
                            text-white
                            text-xs
                            sm:text-sm
                            font-semibold
                            transition-all
                            hover:shadow-md
                          "
                        >
                          View Certificate
                        </button>


                        <button
                          onClick={() =>
                            navigate(
                              `/certificate/${certificate.certificateId}?download=true`
                            )
                          }
                          className="
                            px-3
                            py-2.5
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            hover:bg-gray-50
                            text-gray-700
                            text-xs
                            sm:text-sm
                            font-semibold
                            transition-all
                          "
                        >
                          Download
                        </button>

                      </div>

                    </div>

                  </article>

                );
              })}

            </div>

          )}

        </div>

      </main>

      <Footer />

    </div>
  );
};

export default MyCertificates;