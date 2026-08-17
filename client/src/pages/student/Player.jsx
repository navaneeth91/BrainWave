import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  Lock,
  Play,
  Trophy,
} from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import { getYouTubeVideoId, isYouTubeUrl } from '../../utils/video';
import Footer from '../../components/student/Footer';
import Rating from '../../components/student/Rating';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';
import BrainwaveAIFloatingAssistant from '../../components/student/AI/BrainwaveAIFloatingAssistant';

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

  // Guards against marking a lecture complete more than once when
  // the native video's "ended" event fires.
  const completedAutoRef = useRef(null);

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

  const playerOptions = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      controls: 1,
      showinfo: 0,
    },
  };

  // Automatically marks a BrainWave (Cloudinary) video lecture as
  // completed when it plays to the end, reusing the existing progress API.
  const handleNativeVideoEnded = () => {
    if (!playerdata?.lectureId) return;

    if (completedAutoRef.current === playerdata.lectureId) return;

    completedAutoRef.current = playerdata.lectureId;
    markLectureAsComplete(playerdata.lectureId);
  };

  const totalLectures = progressData?.totalLectures || 0;
  const completedLecturesCount =
    progressData?.completedLectures || 0;
  const progressPercentage =
    totalLectures > 0
      ? Math.round(
          (completedLecturesCount / totalLectures) * 100
        )
      : 0;

  const getLectureDuration = (lectureDuration) =>
    humanizeDuration((lectureDuration || 0) * 60000, {
      units: ['h', 'm'],
      round: true,
    });

  const handleSelectLecture = (
    lecture,
    chapterIndex,
    lectureIndex
  ) => {
    if (!lecture.lectureUrl) return;

    setPlayerData({
      ...lecture,
      chapter: chapterIndex + 1,
      lecture: lectureIndex + 1,
    });

    setOpenSections((prev) => ({
      ...prev,
      [chapterIndex]: true,
    }));
  };

  return courseData ? (
    <>
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-10 xl:px-14">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <button
              type="button"
              onClick={() => navigate('/my-enrollments')}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </button>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Learning Player
                </p>
                <h1 className="mt-1 text-xl font-semibold text-gray-900 sm:text-2xl">
                  {courseData.courseTitle}
                </h1>
              </div>

              <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 lg:w-[340px]">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600">
                    Progress
                  </span>
                  <span className="font-semibold text-gray-900">
                    {progressPercentage}% Complete
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
                {playerdata ? (
                  isYouTubeUrl(playerdata.lectureUrl) ? (
                    <div className="aspect-video w-full">
                      <YouTube
                        videoId={getYouTubeVideoId(
                          playerdata.lectureUrl
                        )}
                        opts={playerOptions}
                        className="h-full w-full"
                        iframeClassName="h-full w-full"
                      />
                    </div>
                  ) : (
                    <video
                      key={playerdata.lectureUrl}
                      src={playerdata.lectureUrl}
                      className="aspect-video w-full bg-black"
                      controls
                      playsInline
                      onEnded={handleNativeVideoEnded}
                    />
                  )
                ) : (
                  <img
                    src={courseData?.courseThumbnail || ''}
                    alt="Course thumbnail"
                    className="aspect-video w-full object-cover"
                  />
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                {playerdata ? (
                  <>
                    <p className="text-sm font-medium text-gray-500">
                      Chapter {playerdata.chapter} • Lecture{' '}
                      {playerdata.lecture}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-gray-900 sm:text-2xl">
                      {playerdata.lectureTitle}
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4" />
                          {getLectureDuration(
                            playerdata.lectureDuration
                          )}
                        </span>
                        {completedLectures.includes(
                          playerdata.lectureId
                        ) ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                            <Check className="h-4 w-4" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-medium text-gray-600">
                            <Circle className="h-4 w-4" />
                            In Progress
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          completedLectures.includes(
                            playerdata.lectureId
                          )
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                        onClick={() =>
                          markLectureAsComplete(
                            playerdata.lectureId
                          )
                        }
                      >
                        {completedLectures.includes(
                          playerdata.lectureId
                        )
                          ? '✓ Completed'
                          : 'Mark as Complete'}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    Select a lecture from the curriculum to start
                    learning.
                  </p>
                )}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-orange-500" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Course Content
                  </h3>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">
                      Course Progress
                    </span>
                    <span className="font-semibold text-gray-900">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {completedLecturesCount} of {totalLectures}{' '}
                    lectures completed
                  </p>
                </div>

                <div className="mt-4 space-y-3 xl:max-h-[520px] xl:overflow-y-auto xl:pr-1">
                  {courseData.courseContent.map(
                    (chapter, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                          onClick={() => toggleSection(index)}
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Chapter {index + 1}:&nbsp;
                              {chapter.chapterTitle}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {
                                chapter.chapterContent
                                  .length
                              }{' '}
                              lectures •{' '}
                              {calculateChapterTime(chapter)}
                            </p>
                          </div>
                          <ChevronDown
                            className={`mt-1 h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300 ${
                              openSections[index]
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        </button>

                        <div
                          className={`overflow-hidden border-t border-gray-100 px-2 transition-all duration-300 ease-in-out ${
                            openSections[index]
                              ? 'max-h-[560px] translate-y-0 py-2 opacity-100'
                              : 'max-h-0 -translate-y-1 py-0 opacity-0'
                          }`}
                        >
                          <ul className="space-y-1">
                            {chapter.chapterContent.map(
                              (lecture, i) => {
                                const isCompleted =
                                  completedLectures.includes(
                                    lecture.lectureId
                                  );
                                const isCurrent =
                                  playerdata?.lectureId ===
                                  lecture.lectureId;
                                const canPlay =
                                  Boolean(
                                    lecture.lectureUrl
                                  );

                                return (
                                  <li
                                    key={i}
                                    className="list-none"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSelectLecture(
                                          lecture,
                                          index,
                                          i
                                        )
                                      }
                                      disabled={!canPlay}
                                      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
                                        isCurrent
                                          ? 'border-orange-300 bg-orange-50'
                                          : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                                      } ${
                                        canPlay
                                          ? 'cursor-pointer'
                                          : 'cursor-not-allowed opacity-60'
                                      }`}
                                    >
                                      <div className="flex min-w-0 items-center gap-2">
                                        {isCompleted ? (
                                          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                                        ) : isCurrent ? (
                                          <Play className="h-4 w-4 shrink-0 text-orange-500" />
                                        ) : (
                                          <Circle className="h-4 w-4 shrink-0 text-gray-400" />
                                        )}
                                        <span className="truncate text-sm text-gray-800">
                                          {
                                            lecture.lectureTitle
                                          }
                                        </span>
                                      </div>
                                      <span className="shrink-0 text-xs font-medium text-gray-500">
                                        {getLectureDuration(
                                          lecture.lectureDuration
                                        )}
                                      </span>
                                    </button>
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {examData && (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        <Trophy className="h-3.5 w-3.5" />
                        Final Assessment
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-gray-900">
                        🎓 Final Assessment
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Course completion assessment
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-center">
                      <p className="text-[11px] text-gray-500">
                        Passing Score
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {examData.passingScore}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-center">
                      <p className="text-[11px] text-gray-500">
                        Time Limit
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {examData.timeLimit} min
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-center">
                      <p className="text-[11px] text-gray-500">
                        Attempts
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {examData.maxAttempts}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={!progressData?.completed}
                    onClick={() =>
                      navigate(
                        `/student/exam/${examData._id}`
                      )
                    }
                    className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold transition ${
                      progressData?.completed
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {progressData?.completed ? (
                      'Take Final Exam →'
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Lock className="h-4 w-4" />
                        Complete all lectures to unlock
                      </span>
                    )}
                  </button>
                </div>
              )}

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  How was this course?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Your feedback helps us improve.
                </p>
                <div className="mt-4">
                  <Rating
                    initialrating={initialRating}
                    onrate={handleRate}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <BrainwaveAIFloatingAssistant
        courseData={courseData}
        currentLecture={playerdata}
      />

      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Player;