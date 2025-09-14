import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '../../components/student/Footer';
import Loading from '../../components/student/Loading';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import { set } from 'mongoose';
import YouTube from 'react-youtube';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseDetails = () => {
  const id=useParams().id;
  const [courseData, setCourseData] = useState(null);

  const [openSections, setopenSections] = useState({});

  const[isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const[playerdata, setPlayerData] = useState(null);


  const {
    allCourses,
    currency,
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoofLectures,
    backendUrl,
    userData,
    getToken,

    
  } = useContext(AppContext);

 const fetchCourseData = async () => {
     try {
      console.log("Full courseData:", courseData);

       const {data}= await axios.get(backendUrl+'/api/course/'+id)
       if(data.success)
       {
        setCourseData(data.courseData)
       }
       else{
        toast.error(data.message);
       }
       
     } catch (error) {
       toast.error(error);
     }
  }
 useEffect(() => {
  fetchCourseData();
}, [id]);

const enrollcourse = async () => {
  try {
    if (!userData) {
      toast.error("Please login to enroll the course");
      return;
    }
    if (isAlreadyEnrolled) {
      toast.error("You are already enrolled in this course");
      return;
    }

    const token =  await getToken();                        
    const { data } = await axios.post(
      `${backendUrl}/api/user/purchase`,
      { courseId: courseData._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      window.location.replace(data.sessionUrl);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message || "Something went wrong");
  }
};

  useEffect(() => {
    if(userData && courseData){
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id));
    }
  }, [userData, courseData]);
  const toggleSection=((index)=>{
    setopenSections((prev)=>(
      {...prev,
        [index]:!prev[index],
      }
    ))
  })



  return  courseData?(
    <>
    <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left'>

      <div className='absolute top-0 left-0 w-full h-section-height -z-1  bg-gradient-to-b from-orange-200/70'></div>
      {/*left side*/}
      <div className="max-w-xl z-10 text-gray-600">
          <h1 className="md:text-course-details-heading-large text-text-course-details-heading-small font-semibold text-gray-800">{courseData.courseTitle}</h1>
          <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: courseData.courseDescription?.slice(0, 200),}}
      ></p>
      {/* rating and reviews */}
      <div className='flex items-center space-x-2  pt-3 pb-1 text-small'>
          <p>{calculateRating(courseData)}</p>
          <div className='flex'>
              {[...Array(5)].map((_, i) => (
                 <img key={i} src={i<Math.floor(calculateRating(courseData))?assets.star:assets.star_blank} alt="Star" className='w-3.5 h-3.5' />
                    ))}
           </div>
          <p className="text-blue-500">
          ({courseData.courseRatings.length}{" "}
          {courseData.courseRatings.length > 1 ? "ratings" : "rating"})
        </p>
        <p>
          {courseData?.enrolledStudents?.length || 0}{" "}
          {(courseData?.enrolledStudents?.length || 0) > 1 ? "students" : "student"}
        </p>


      </div>
        <p className="text-sm mt-2"> Course by{" "} <span className="text-blue-600 underline">Navaneeth</span></p>
      <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
                    <div key={index} className="border border-gray-300 rounded bg-white mb-2">
                          <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none" onClick={() => toggleSection(index)}>
                              <div className="flex items-center gap-2">
                                  <img src={assets.down_arrow_icon} alt="" className={`transform transition-transition ${openSections[index]?'rotate-180':''}`} />
                                   <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                              </div>
                              <p className="text-sm md:text-default text-gray-500"> {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)} </p>
                          </div>
                          <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                            <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                               {chapter.chapterContent.map((lecture, i) => (
                               <li key={i} className="flex items-start gap-2 py-1">
                                <img src={assets.play_icon} alt="" className="h-4 w-4 mt-1" />
                                 <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">        
                                   <p>{lecture.lectureTitle}</p>
                                   <div className="flex gap-2">
                                     {lecture.isPreviewFree && (
                                       <p className="text-blue-500 cursor-pointer" onClick={()=>setPlayerData({
                                          videoid: lecture.lectureUrl.split('/').pop()
                                       })}>Preview</p>
                                     )}
                                     <p>{humanizeDuration(lecture.lectureDuration * 60000, { units: ['h', 'm'], round: true })}</p>
                                     </div>
                                 </div>
                               </li>
                             ))}
                            </ul>
                          </div>
                         </div>
                      ))}
            </div>
      </div>
       <div className='py-20 text-sm md:text-default'>
          <h3 className="text-xl font-semibold text-gray-800">Course Description</h3>
          <p
            className="pt-3 rich-text"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription,
            }}
          ></p>
        </div>

    </div>

      {/*right side*/}
      <div className='max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]'>
      
         {
            playerdata?
            <YouTube videoId={playerdata.videoid}  opts={{ playerVars: { autoplay: 1 } }} iframeClassName='w-full aspect-video' />
            :<img src={courseData.courseThumbnail} alt="" />
          }
      <div className="p-5">
        <div className='flex items-center gap-2'>
          
          <img className='w-3.5' src={assets.time_left_clock_icon} alt="" />
          <p className="text-red-500">
            <span className="font-medium">5 days</span> left at this Price!
          </p>
        </div>
        <div className='flex gap-3 items-center pt-2'>
          <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>{currency}{(courseData.coursePrice-courseData.discount * courseData.coursePrice/100).toFixed(2)}</p>
          <p className='md:text-lg text-gray-500 line-through'>{currency}{courseData.coursePrice}</p>
          <p className='md:text-lg text-gray-500'>{courseData.discount}%off</p>
        </div>
        <div className='flex items-center  text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-600'>
            <div className='flex items-center gap-1'>
              <img src={assets.star} alt="star"  className=''/>
              <p>{calculateRating(courseData)}</p>
            </div>

            <div className='h-4 w-px bg-gray-500/40'></div>

             <div className='flex items-center gap-1'>
              <img src={assets.time_clock_icon} alt="star"  className=''/>
              <p>{calculateCourseDuration(courseData)}</p>
            </div>

             <div className='h-4 w-px bg-gray-500/40'></div>

            <div className='flex items-center gap-1'>
              <img src={assets.lesson_icon} alt="star"  className=''/>
              <p>{calculateNoofLectures(courseData)} Lessons</p>
            </div>
            
        </div>
        <button onClick={enrollcourse } className='md:mt-6 mt-4 w-full py-3 rounded bg-orange-600 text-white font-medium'>{isAlreadyEnrolled?'Already Enrolled':'Enroll Now'}</button>
        <div className='pt-6'>
          <p className='md:text-xl text-lg font-medium text-gray-800'>What's in the Course</p>
          <ul className='ml-4 list-disc text-gray-600 text-sm md:text-default'>
            <li>Lifetime access with free updates.</li>
            <li>Access to all course materials, including videos, quizzes, and assignments.</li>
            <li>Downloadable resources and source code.</li>
            <li>Certificate of completion.</li>
            <li>Access to a community of learners for networking and support.</li>  
          </ul>
        </div>
      </div>
    </div>

    </div>
    <Footer />
    </>
  ): <Loading />;
};

export default CourseDetails;
