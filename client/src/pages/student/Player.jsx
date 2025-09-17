import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
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
  } = useContext(AppContext);

  const { courseId } = useParams();
  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerdata, setPlayerData] = useState(null);

  const getCourseData = () => {
    enrolledCourses.forEach((course) => {
      if (course._id === courseId) {
        setCourseData(course);

        // Set user rating if exists
        course.courseRatings.map((item) => {
          if (item.userId === userData._id) {
            setInitialRating(item.rating);
          }
        })
      }
    })
  }

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData();
    }
  }, [enrolledCourses]);

  const markLectureAsComplete = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/update-course-progress',
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message);
        getCourseProgress();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/get-course-progress',
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        setProgressData(
          data.progressData
        )
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
const handleRate = async (rating) => {
  try {
    const token = await getToken();
    console.log('Sending rating:', rating, 'for course:', courseId);

    const { data } = await axios.post(
      backendUrl + '/api/user/add-user-rating',
      { courseId, rating: Number(rating) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Response:', data);

    if (data.success) {
      toast.success(data.message);
      fetchEnrolledCourses(); // refresh course data if needed
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error('Rating error:', error);
    toast.error(error.message || 'Something went wrong');
  }
};


  useEffect(() => {
    getCourseProgress();
  }, []);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const completedLectures = progressData && progressData.completedLectures
  ? progressData.completedLectures
  : [];

  const getYouTubeVideoId = (url) => {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
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
    {/* if (!courseData || !progressData) return <Loading />; */}

      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* Left side */}
        <div className="text-gray-600">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData.courseContent.map((chapter, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded bg-white mb-2"
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.down_arrow_icon}
                      alt=""
                      className={`transform transition-transform ${
                        openSections[index] ? 'rotate-180' : ''
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
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSections[index] ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img
                          src={
                            completedLectures.includes(lecture.lectureId)
                              ? assets.blue_tick_icon
                              : assets.play_icon
                          }
                          alt=""
                          className="h-4 w-4 mt-1"
                        />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p>{lecture.lectureTitle}</p>
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
                              {humanizeDuration(lecture.lectureDuration * 60000, {
                                units: ['h', 'm'],
                                round: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-10">
            <h1 className="text-xl font-bold">Rate This Course:</h1>
            <Rating initialRating={initialRating} onrate={handleRate} />
          </div>
        </div>

        {/* Right side */}
        <div className="md:mt-10">
          {playerdata ? (
            <div>
            <YouTube
              videoId={getYouTubeVideoId(playerdata.lectureUrl)}
              opts={playerOptions}
              iframeClassName="w-full aspect-video"
            />

              <div className="flex items-center justify-between mt-1">
                <p className="text-gray-800 text-sm md:text-default">
                  {playerdata.chapter}.{playerdata.lecture}{' '}
                  {playerdata.lectureTitle}
                </p>
                <button
                  className="text-orange-600"
                  onClick={() => markLectureAsComplete(playerdata.lectureId)}
                >
                  {completedLectures.includes(playerdata.lectureId)
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
