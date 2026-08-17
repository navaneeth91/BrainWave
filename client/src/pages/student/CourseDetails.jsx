import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import { isYouTubeUrl, getYouTubeVideoId } from "../../utils/video";
import axios from "axios";
import { toast } from "react-toastify";
import AOS from "aos";
import "aos/dist/aos.css";

const CourseDetails = () => {
  const { id } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerdata, setPlayerData] = useState(null);

  const {
    currency,
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoofLectures,
    backendUrl,
    userData,
    getToken,
    freeCoursesMode,
  } = useContext(AppContext);

  // =========================
  // FETCH COURSE
  // =========================

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/course/${id}`
      );

      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Course fetch error:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to load course"
      );
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  // =========================
  // AOS
  // =========================

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  // =========================
  // ENROLL
  // =========================

  const enrollcourse = async () => {
    try {
      if (!userData) {
        toast.error("Please login to enroll in this course");
        return;
      }

      if (isAlreadyEnrolled) {
        toast.info("You are already enrolled in this course");
        return;
      }

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        {
          courseId: courseData._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        window.location.replace(data.sessionUrl);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Enrollment error:", error);

      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // =========================
  // CHECK ENROLLMENT
  // =========================

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(
        userData.enrolledCourses?.includes(
          courseData._id
        )
      );
    }
  }, [userData, courseData]);

  // =========================
  // TOGGLE CHAPTER
  // =========================

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!courseData) {
    return <Loading />;
  }

  const rating = calculateRating(courseData);

  const discountedPrice = (
    courseData.coursePrice -
    (courseData.discount * courseData.coursePrice) / 100
  ).toFixed(2);

  const totalLectures = calculateNoofLectures(courseData);

  const totalStudents =
    courseData?.enrolledStudents?.length || 0;

  return (
    <>
      <main className="bg-white text-gray-800">

        {/* =====================================================
            HERO SECTION
        ====================================================== */}

        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">

          {/* Decorative background */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />

          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-16">

            <div className="grid lg:grid-cols-[1fr_430px] gap-10 xl:gap-16 items-start">

              {/* ================= LEFT ================= */}

              <div
                className="max-w-3xl"
                data-aos="fade-right"
              >

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <span>Home</span>
                  <span>›</span>
                  <span>Courses</span>
                  <span>›</span>
                  <span className="text-orange-600 font-medium">
                    Course Details
                  </span>
                </div>

                {/* Badge */}

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-semibold mb-5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {freeCoursesMode
                    ? "FREE COURSE"
                    : "ONLINE COURSE"}
                </div>

                {/* Title */}

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                  {courseData.courseTitle}
                </h1>

                {/* Description */}

                <div
                  className="mt-5 text-gray-600 text-sm sm:text-base leading-7 max-w-2xl"
                  dangerouslySetInnerHTML={{
                    __html:
                      courseData.courseDescription?.slice(
                        0,
                        300
                      ),
                  }}
                />

                {/* Rating */}

                <div className="flex flex-wrap items-center gap-3 mt-6">

                  <div className="flex items-center gap-1.5">

                    <span className="font-bold text-gray-900">
                      {rating}
                    </span>

                    <div className="flex">
                      {[...Array(5)].map(
                        (_, index) => (
                          <img
                            key={index}
                            src={
                              index <
                              Math.floor(rating)
                                ? assets.star
                                : assets.star_blank
                            }
                            alt=""
                            className="w-4 h-4"
                          />
                        )
                      )}
                    </div>

                  </div>

                  <span className="text-sm text-blue-600">
                    ({courseData.courseRatings.length}{" "}
                    {courseData.courseRatings.length ===
                    1
                      ? "rating"
                      : "ratings"}
                    )
                  </span>

                  <span className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full" />

                  <span className="text-sm text-gray-600">
                    {totalStudents.toLocaleString()}{" "}
                    {totalStudents === 1
                      ? "student"
                      : "students"}
                  </span>

                </div>

                {/* Instructor */}

                <div className="flex items-center gap-3 mt-7">

                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold">
                    N
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Course instructor
                    </p>

                    <p className="font-semibold text-gray-800">
                      Navaneeth
                    </p>
                  </div>

                </div>

                {/* Quick stats */}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-9">

                  <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-4">
                    <p className="text-xl font-bold text-gray-900">
                      {totalLectures}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Lessons
                    </p>
                  </div>

                  <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-4">
                    <p className="text-xl font-bold text-gray-900">
                      {calculateCourseDuration(
                        courseData
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Duration
                    </p>
                  </div>

                  <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-4">
                    <p className="text-xl font-bold text-gray-900">
                      {rating}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Rating
                    </p>
                  </div>

                  <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-4">
                    <p className="text-xl font-bold text-gray-900">
                      100%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Online
                    </p>
                  </div>

                </div>

              </div>

              {/* =================================================
                  PURCHASE CARD
              ================================================== */}

              <div
                className="lg:sticky lg:top-24"
                data-aos="fade-left"
              >

                <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-200 overflow-hidden">

                  {/* Preview */}

                  <div className="relative">

                    {playerdata ? (
                      isYouTubeUrl(playerdata.lectureUrl) ? (
                        <YouTube
                          videoId={getYouTubeVideoId(
                            playerdata.lectureUrl
                          )}
                          opts={{
                            playerVars: {
                              autoplay: 1,
                            },
                          }}
                          iframeClassName="w-full aspect-video"
                        />
                      ) : (
                        <video
                          key={playerdata.lectureUrl}
                          src={playerdata.lectureUrl}
                          className="w-full aspect-video bg-black"
                          controls
                          autoPlay
                          playsInline
                        />
                      )
                    ) : (
                      <div className="relative group">

                        <img
                          src={
                            courseData.courseThumbnail
                          }
                          alt={
                            courseData.courseTitle
                          }
                          className="w-full aspect-video object-cover"
                        />

                        {/* Overlay */}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">

                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-gray-800">
                            Course Preview
                          </span>

                          <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-lg">
                            ▶
                          </span>

                        </div>

                      </div>
                    )}

                  </div>

                  {/* Card content */}

                  <div className="p-6">

                    {/* Price */}

                    <div className="flex items-end gap-3">

                      <span className="text-3xl sm:text-4xl font-bold text-gray-900">

                        {freeCoursesMode
                          ? "Free"
                          : `${currency}${discountedPrice}`}
                      </span>

                      {!freeCoursesMode &&
                        courseData.discount >
                          0 && (
                          <>
                            <span className="text-gray-400 line-through text-lg pb-1">
                              {currency}
                              {courseData.coursePrice}
                            </span>

                            <span className="text-green-600 font-semibold text-sm pb-1">
                              {courseData.discount}% OFF
                            </span>
                          </>
                        )}

                    </div>

                    {/* Limited offer */}

                    <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-orange-50 border border-orange-100">

                      <img
                        src={
                          assets.time_left_clock_icon
                        }
                        alt=""
                        className="w-4"
                      />

                      <p className="text-sm text-orange-700">
                        <span className="font-semibold">
                          {freeCoursesMode
                            ? "Limited access"
                            : "Special pricing"}
                        </span>{" "}
                        available now
                      </p>

                    </div>

                    {/* Stats */}

                    <div className="grid grid-cols-3 border-y border-gray-100 my-5 py-4">

                      <div className="text-center">

                        <div className="flex justify-center items-center gap-1">
                          <img
                            src={assets.star}
                            alt=""
                            className="w-4 h-4"
                          />

                          <span className="font-semibold text-gray-800">
                            {rating}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mt-1">
                          Rating
                        </p>

                      </div>

                      <div className="text-center border-x border-gray-100">

                        <p className="font-semibold text-gray-800">
                          {calculateCourseDuration(
                            courseData
                          )}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Duration
                        </p>

                      </div>

                      <div className="text-center">

                        <p className="font-semibold text-gray-800">
                          {totalLectures}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Lessons
                        </p>

                      </div>

                    </div>

                    {/* Enrollment */}

                    <button
                      onClick={enrollcourse}
                      className={`w-full py-3.5 rounded-xl text-white font-semibold text-base shadow-lg transition-all duration-300 ${
                        isAlreadyEnrolled
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-orange-600 hover:bg-orange-700 hover:shadow-orange-200"
                      }`}
                    >
                      {isAlreadyEnrolled
                        ? "✓ Already Enrolled"
                        : freeCoursesMode
                        ? "Enroll for Free"
                        : "Enroll Now"}
                    </button>

                    {/* Trust */}

                    <p className="text-center text-xs text-gray-400 mt-3">
                      Secure enrollment • Instant access
                    </p>

                    {/* Included */}

                    <div className="mt-7">

                      <h3 className="font-semibold text-gray-900">
                        What's included
                      </h3>

                      <ul className="mt-4 space-y-3">

                        {[
                          "Full course access",
                          "Video lectures and resources",
                          "Downloadable source code",
                          "Progress tracking",
                          "Certificate of completion",
                        ].map(
                          (item, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-3 text-sm text-gray-600"
                            >
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">
                                ✓
                              </span>

                              {item}
                            </li>
                          )
                        )}

                      </ul>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            COURSE CONTENT
        ====================================================== */}

        <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20">

          <div className="max-w-4xl">

            {/* Heading */}

            <div data-aos="fade-up">

              <span className="text-orange-600 text-sm font-semibold uppercase tracking-wider">
                Course curriculum
              </span>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                Course Structure
              </h2>

              <p className="text-gray-500 mt-3">
                Explore all chapters and lectures included
                in this course.
              </p>

            </div>

            {/* Curriculum stats */}

            <div
              className="flex flex-wrap gap-5 mt-7 text-sm text-gray-500"
              data-aos="fade-up"
            >

              <span>
                <strong className="text-gray-800">
                  {courseData.courseContent.length}
                </strong>{" "}
                chapters
              </span>

              <span>
                <strong className="text-gray-800">
                  {totalLectures}
                </strong>{" "}
                lectures
              </span>

              <span>
                <strong className="text-gray-800">
                  {calculateCourseDuration(
                    courseData
                  )}
                </strong>{" "}
                total duration
              </span>

            </div>

            {/* Chapters */}

            <div className="mt-8 space-y-3">

              {courseData.courseContent.map(
                (chapter, index) => {

                  const isOpen =
                    openSections[index];

                  return (
                    <div
                      key={index}
                      className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                        isOpen
                          ? "border-orange-300 shadow-md"
                          : "border-gray-200"
                      }`}
                      data-aos="fade-up"
                      data-aos-delay={
                        index * 50
                      }
                    >

                      {/* Chapter header */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleSection(index)
                        }
                        className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left bg-white hover:bg-orange-50/40 transition"
                      >

                        <div className="flex items-center gap-4">

                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                              isOpen
                                ? "bg-orange-600 text-white"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </div>

                          <div>

                            <h3 className="font-semibold text-gray-900">
                              {
                                chapter.chapterTitle
                              }
                            </h3>

                            <p className="text-xs text-gray-500 mt-1">
                              {
                                chapter
                                  .chapterContent
                                  .length
                              }{" "}
                              lectures •{" "}
                              {calculateChapterTime(
                                chapter
                              )}
                            </p>

                          </div>

                        </div>

                        <div
                          className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 ${
                            isOpen
                              ? "rotate-180 bg-orange-100"
                              : ""
                          }`}
                        >
                          <img
                            src={
                              assets.down_arrow_icon
                            }
                            alt=""
                            className="w-4"
                          />
                        </div>

                      </button>

                      {/* Lectures */}

                      <div
                        className={`grid transition-all duration-300 ${
                          isOpen
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }`}
                      >

                        <div className="overflow-hidden">

                          <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3">

                            {chapter.chapterContent.map(
                              (
                                lecture,
                                lectureIndex
                              ) => (
                                <div
                                  key={
                                    lectureIndex
                                  }
                                  className="flex items-center justify-between gap-4 py-3 px-3 rounded-lg hover:bg-white hover:shadow-sm transition"
                                >

                                  <div className="flex items-center gap-3 min-w-0">

                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">

                                      <img
                                        src={
                                          assets.play_icon
                                        }
                                        alt=""
                                        className="w-3.5 h-3.5"
                                      />

                                    </div>

                                    <p className="text-sm text-gray-700 truncate">
                                      {
                                        lecture.lectureTitle
                                      }
                                    </p>

                                  </div>

                                  <div className="flex items-center gap-3 flex-shrink-0">

                                    {lecture.isPreviewFree && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPlayerData(
                                            {
                                              ...lecture,
                                            }
                                          )
                                        }
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                      >
                                        Preview
                                      </button>
                                    )}

                                    <span className="text-xs text-gray-400">
                                      {humanizeDuration(
                                        lecture.lectureDuration *
                                          60000,
                                        {
                                          units: [
                                            "h",
                                            "m",
                                          ],
                                          round: true,
                                        }
                                      )}
                                    </span>

                                  </div>

                                </div>
                              )
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            DESCRIPTION
        ====================================================== */}

        <section className="bg-gray-50 border-y border-gray-100">

          <div
            className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20"
            data-aos="fade-up"
          >

            <div className="max-w-4xl">

              <span className="text-orange-600 text-sm font-semibold uppercase tracking-wider">
                About this course
              </span>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                Course Description
              </h2>

              <div
                className="rich-text mt-6 text-gray-600 leading-8 text-sm sm:text-base"
                dangerouslySetInnerHTML={{
                  __html:
                    courseData.courseDescription,
                }}
              />

            </div>

          </div>

        </section>

        {/* =====================================================
            FINAL CTA
        ====================================================== */}

        <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14">

          <div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-orange-500 px-7 sm:px-12 py-10 text-white"
            data-aos="zoom-in"
          >

            {/* Decorative circles */}

            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />

            <div className="absolute -left-16 -bottom-24 w-60 h-60 rounded-full bg-white/10" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-7">

              <div>

                <h2 className="text-2xl sm:text-3xl font-bold">
                  Ready to start learning?
                </h2>

                <p className="mt-2 text-orange-100 max-w-xl">
                  Join other learners and start building
                  your skills with this course today.
                </p>

              </div>

              <button
                onClick={enrollcourse}
                className="flex-shrink-0 px-8 py-3.5 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition shadow-lg"
              >
                {isAlreadyEnrolled
                  ? "Go to Course"
                  : freeCoursesMode
                  ? "Start Learning"
                  : "Enroll Now"}
              </button>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
};

export default CourseDetails;