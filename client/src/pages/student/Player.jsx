import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../components/student/Footer';
import Rating from '../../components/student/Rating';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const Player = () => {
  const {
    enrolledCourses,
    calculateChapterTime,
    backendUrl,
    getToken,
    userData,
    fetchEnrolledCourses,
    fetchCourseExam,
  } = useContext(AppContext);

  const { courseId } = useParams();
  const navigate = useNavigate();

  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerdata, setPlayerData] = useState(null);
  const [examData, setExamData] = useState(null);

  // Get course data
  const getCourseData = () => {
    enrolledCourses.forEach((course) => {
      if (course._id === courseId) {
        setCourseData(course);

        // Set user rating if exists
        course.courseRatings?.forEach((item) => {
          if (item.userId === userData?._id) {
            setInitialRating(item.rating);
          }
        });
      }
    });
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData();
    }
  }, [enrolledCourses, courseId, userData]);

  // Fetch course exam
  useEffect(() => {
    const loadExam = async () => {
      if (!courseId) return;

      const exam = await fetchCourseExam(courseId);
      setExamData(exam);
    };

    loadExam();
  }, [courseId, fetchCourseExam]);

  // Mark lecture as complete
  const markLectureAsComplete = async (lectureId) => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        backendUrl + '/api/user/update-course-progress',
        {
          courseId,
          lectureId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);

        // Refresh course progress
        await getCourseProgress();

        // Course completed - unlock final exam
        if (data.completed) {
          toast.success(
            "🎉 Congratulations! You completed the course! Your final exam is now unlocked."
          );
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get course progress
  const getCourseProgress = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(
        `${backendUrl}/api/user/course-progress/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setProgressData(data.progressData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
      toast.error(error.message);
    }
  };

  // Handle course rating
  const handleRate = async (rating) => {
    try {
      const token = await getToken();

      console.log(
        'Sending rating:',
        rating,
        'for course:',
        courseId
      );

      const { data } = await axios.post(
        backendUrl + '/api/user/add-user-rating',
        {
          courseId,
          rating: Number(rating),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Response:', data);

      if (data.success) {
        toast.success(data.message);
        fetchEnrolledCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Rating error:', error);
      toast.error(error.message || 'Something went wrong');
    }
  };

  // Load progress
  useEffect(() => {
    if (courseId) {
      getCourseProgress();
    }
  }, [courseId]);

  // Toggle chapter
  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const completedLectures =
    progressData?.lectureCompleted || [];

  // YouTube video ID
  const getYouTubeVideoId = (url) => {
    if (!url) return null;

    const regExp =
      /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;

    const match = url.match(regExp);

    return match ? match[1] : null;
  };

  const playerOptions = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      controls: 1,
      showinfo: 0,
    },
  };

  return courseData ? (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">

        {/* ================= LEFT SIDE ================= */}
        <div className="text-gray-600">

          <h2 className="text-xl font-semibold">
            Course Structure
          </h2>

          <div className="pt-5">

            {courseData.courseContent.map(
              (chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded bg-white mb-2"
                >

                  {/* Chapter Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >

                    <div className="flex items-center gap-2">

                      <img
                        src={assets.down_arrow_icon}
                        alt="dropdown_arrow"
                        className={`transform transition-transform ${
                          openSections[index]
                            ? 'rotate-180'
                            : ''
                        }`}
                      />

                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>

                    </div>

                    <p className="text-sm md:text-default text-gray-500">
                      {chapter.chapterContent.length} lectures -{' '}
                      {calculateChapterTime(chapter)}
                    </p>

                  </div>

                  {/* Lectures */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index]
                        ? 'max-h-96'
                        : 'max-h-0'
                    }`}
                  >

                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">

                      {chapter.chapterContent.map(
                        (lecture, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 py-1"
                          >

                            <img
                              src={
                                completedLectures.includes(
                                  lecture.lectureId
                                )
                                  ? assets.blue_tick_icon
                                  : assets.play_icon
                              }
                              alt="lecture_icon"
                              className="h-4 w-4 mt-1"
                            />

                            <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">

                              <p>
                                {lecture.lectureTitle}
                              </p>

                              <div className="flex gap-2">

                                {lecture.lectureUrl && (
                                  <p
                                    className="text-blue-500 cursor-pointer"
                                    onClick={() =>
                                      setPlayerData({
                                        ...lecture,
                                        chapter: index + 1,
                                        lecture: i + 1,
                                      })
                                    }
                                  >
                                    Watch
                                  </p>
                                )}

                                <p>
                                  {humanizeDuration(
                                    lecture.lectureDuration *
                                      60000,
                                    {
                                      units: ['h', 'm'],
                                      round: true,
                                    }
                                  )}
                                </p>

                              </div>

                            </div>

                          </li>
                        )
                      )}

                    </ul>

                  </div>

                </div>
              )
            )}

          </div>

          {/* ================= FINAL EXAM ================= */}

          {examData && (
            <div className="mt-8 border border-gray-200 rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="text-2xl">
                      🎓
                    </span>

                    <h2 className="text-xl font-bold text-gray-800">
                      Final Exam
                    </h2>

                  </div>

                  <p className="text-gray-600 mt-2">
                    {examData.title}
                  </p>

                  {examData.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {examData.description}
                    </p>
                  )}

                </div>

                <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                  FINAL
                </span>

              </div>

              {/* Exam Information */}

              <div className="grid grid-cols-3 gap-3 mt-5">

                <div className="bg-gray-50 rounded-lg p-3 text-center">

                  <p className="text-xs text-gray-500">
                    Passing Score
                  </p>

                  <p className="font-bold text-gray-800">
                    {examData.passingScore}%
                  </p>

                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-center">

                  <p className="text-xs text-gray-500">
                    Time Limit
                  </p>

                  <p className="font-bold text-gray-800">
                    {examData.timeLimit} min
                  </p>

                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-center">

                  <p className="text-xs text-gray-500">
                    Attempts
                  </p>

                  <p className="font-bold text-gray-800">
                    {examData.maxAttempts}
                  </p>

                </div>

              </div>

              {/* Exam Button */}

              <button
                disabled={!progressData?.completed}
                onClick={() =>
                  navigate(
                    `/student/exam/${examData._id}`
                  )
                }
                className={`w-full mt-5 py-3 rounded-lg font-semibold transition ${
                  progressData?.completed
                    ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >

                {progressData?.completed
                  ? 'Take Final Exam →'
                  : '🔒 Complete Course to Unlock Exam'}

              </button>

            </div>
          )}

          {/* ================= RATING ================= */}

          <div className="flex items-center justify-between mt-10">

            <h1 className="text-xl font-bold">
              Rate This Course:
            </h1>

            <Rating
              initialRating={initialRating}
              onrate={handleRate}
            />

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="md:mt-10">

          {playerdata ? (

            <div>

              <YouTube
                videoId={getYouTubeVideoId(
                  playerdata.lectureUrl
                )}
                opts={playerOptions}
                iframeClassName="w-full aspect-video"
              />

              <div className="flex items-center justify-between mt-1">

                <p className="text-gray-800 text-sm md:text-default">

                  {playerdata.chapter}.
                  {playerdata.lecture}{' '}
                  {playerdata.lectureTitle}

                </p>

                <button
                  className="text-orange-600"
                  onClick={() =>
                    markLectureAsComplete(
                      playerdata.lectureId
                    )
                  }
                >
                  {completedLectures.includes(
                    playerdata.lectureId
                  )
                    ? 'Completed'
                    : 'Mark as Complete'}
                </button>

              </div>

            </div>

          ) : (

            <img
              src={courseData?.courseThumbnail || ''}
              alt="Course thumbnail"
            />

          )}

        </div>

      </div>

      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Player;