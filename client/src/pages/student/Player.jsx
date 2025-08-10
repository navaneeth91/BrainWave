import React, { useState ,useEffect} from 'react'
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../components/student/Footer';
import Rating from '../../components/student/Rating';
const Player = () => {
  const {enrolledCourses,calculateChapterTime} = useContext(AppContext);
  const {courseId} = useParams();
  const [courseData,setCourseData] = useState(null);
  const [openSections, setopenSections] = useState({});
  const [playerdata, setPlayerData] = useState(null);


  const getcourseData = () => {
     console.log("Enrolled Courses:", enrolledCourses);
   console.log("Course ID from URL:", courseId);
    enrolledCourses.map((course)=>{
      if(course._id===courseId){
        setCourseData(course);
      }
    }
  )
}
useEffect(() => {
  getcourseData();  
}, [enrolledCourses]);

  const toggleSection=((index)=>{
    setopenSections((prev)=>(
      {...prev,
        [index]:!prev[index],
      }
    ))
  })


  return (
    <>
    <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36 '>
      {/*left side*/}
      <div className='text-gray-600'>
      <h2 className='text-xl font-semibold'>Course Structure</h2>
          <div className="pt-5">
              {courseData && courseData.courseContent.map((chapter, index) => (
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
                           <img src={false?assets.blue_tick_icon:assets.play_icon} alt="" className="h-4 w-4 mt-1" />
                            <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">        
                              <p>{lecture.lectureTitle}</p>
                              <div className="flex gap-2">
                                {lecture.lectureUrl && (
                                 <p className="text-blue-500 cursor-pointer" onClick={()=>setPlayerData({
                                  ...lecture,chapter:index+1,lecture:i+1
                                 })}>Watch</p>
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
      <div className='flex items-center justify-between mt-10'>
        <h1 className='text-xl font-bold'>Rate This Course:</h1>
        <Rating/>
      </div>
      </div>
      {/*right side*/}
      <div className='md:mt-10'>
          {playerdata ? (
            <div>
             <YouTube videoId={playerdata.lectureUrl.split('/').pop()}   iframeClassName='w-full aspect-video' />
             <div className='flex items-center justify-between mt-1'>
              <p className='text-gray-800 text-sm md:text-default'>
                {playerdata.chapter}.{playerdata.lecture} {playerdata.lectureTitle}
              </p>
              <button className='text-orange-600'>Mark as Complete</button>
             </div>
             </div>
          ):
          <img src={courseData?courseData.courseThumbnail:' '} alt="" />}
      </div>
    </div>
    <Footer/>
    </>
  )
}

export default Player
