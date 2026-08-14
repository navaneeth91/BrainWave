import { createContext,use,useEffect,useLayoutEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
export const AppContext = createContext();
import {useAuth,useUser} from '@clerk/clerk-react'
import axios from "axios";
import { toast } from "react-toastify";



export const AppContextProvider = (props)=>{
    const backendUrl=import.meta.env.VITE_BACKEND_URL
    const freeCoursesMode = import.meta.env.VITE_FREE_COURSES_MODE !== 'false';
    const [allCourses, setAllCourses] = useState([])

    const [isEducator, setIsEducator] = useState(false)
    const [enrolledCourses, setenrolledCourses] = useState([])
    const [userData, setUserData] = useState(null)
    const currency=import.meta.env.VITE_CURRENCY || '$';

    const navigate=useNavigate();

    const{getToken}=useAuth()
    const{user}=useUser()

    //fetch alla courses
    const fetchAllCourses = async () => {
        try {
            const {data}=await axios.get(backendUrl+'/api/course/all');
            if(data.success){
            setAllCourses(data.courses);
            }
            else{
                 toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //fetch user data
    const fetchUserData = async () => {
        try {
            setIsEducator(user?.publicMetadata?.role === 'educator');
            const token=await getToken();
            const {data}=await axios.get(backendUrl+'/api/user/data', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if(data.success){
            setUserData(data.user);
            }
            else{
                 toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }



    //function to calculate average rating
    const calculateRating = (course) => {
        if ( course.courseRatings.length === 0) return 0;
        let total = 0;
        course.courseRatings.forEach((rating) => {
            total += rating.rating;
        }); 
        return Math.floor(total / course.courseRatings.length);

    }
    //function to calculate course chapter time
    const calculateChapterTime = (chapter)=>{
        let time=0
        chapter.chapterContent.map((lecture)=>time+=lecture.lectureDuration)
        return humanizeDuration(time*60*1000,{units:['h', 'm']})
    } 
    //function to calculate course duration
    const calculateCourseDuration = (course) => {
        let total = 0;
        course.courseContent.map((chapter)=>chapter.chapterContent.map((lecture)=>total+=lecture.lectureDuration))
        return humanizeDuration(total*60*1000,{units:['h', 'm']})
    }
    //function to fecth enrolled courses
    const fetchEnrolledCourses = async () => {
        try{
            const token=await getToken();
            const {data}=await axios.get(backendUrl+'/api/user/data/enrolled-courses',{
                headers:{
                    Authorization: `Bearer ${token}`
                }
        });
        if(data.success){
            setenrolledCourses(data.enrolledCourses.reverse())
        }
        else{
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message);
    }
}
// Generate course certificate
const generateCertificate = async (courseId) => {
    try {
        const token = await getToken();

        const { data } = await axios.post(
            `${backendUrl}/api/user/generate-certificate/${courseId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (data.success) {
            toast.success(data.message);
            return data.certificate;
        } else {
            toast.error(data.message);
            return null;
        }

    } catch (error) {
        toast.error(
            error.response?.data?.message || error.message
        );
        return null;
    }
};
    //function to calculate no of lectures in course
    const calculateNoofLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
        if (Array.isArray(chapter.chapterContent)) {
            totalLectures += chapter.chapterContent.length;
        }
    });
    return totalLectures;
};
  useEffect(()=>{
    if(user){
        fetchUserData();
        fetchEnrolledCourses();
    }
  },[user,getToken])
    useLayoutEffect(() => {
        fetchAllCourses();
        
    }, []);
    const value={
        currency,
        allCourses,
        navigate,
        calculateRating,
        isEducator,
        setIsEducator,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoofLectures,
        setenrolledCourses,
        enrolledCourses,
        backendUrl,
        freeCoursesMode,
        userData,
        setUserData,
        fetchUserData,
        fetchEnrolledCourses,
        fetchAllCourses,
        getToken,
        generateCertificate
    }
    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}