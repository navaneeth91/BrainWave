import { createContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const freeCoursesMode = import.meta.env.VITE_FREE_COURSES_MODE !== "false";
    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    const api = useMemo(() => axios.create({
        baseURL: backendUrl,
        withCredentials: true,
    }), [backendUrl]);

    const [allCourses, setAllCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setenrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const isAuthenticated = Boolean(userData);

    const refreshUser = async () => {
        try {
            const { data } = await api.get("/api/auth/me");
            if (data.success) {
                setUserData(data.user);
                setIsEducator(data.user.role === "educator");
                return data.user;
            }
            setUserData(null);
            setIsEducator(false);
            return null;
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Fetch user error:", error);
            }
            setUserData(null);
            setIsEducator(false);
            return null;
        } finally {
            setAuthLoading(false);
        }
    };

    const register = async (payload) => {
        const { data } = await api.post("/api/auth/register", payload);
        if (data.success) {
            setUserData(data.user);
            setIsEducator(data.user.role === "educator");
        }
        return data;
    };

    const login = async (payload) => {
        const { data } = await api.post("/api/auth/login", payload);
        if (data.success) {
            setUserData(data.user);
            setIsEducator(data.user.role === "educator");
        }
        return data;
    };

    const logout = async () => {
        try {
            const { data } = await api.post("/api/auth/logout");
            if (data.success) {
                setUserData(null);
                setIsEducator(false);
                setenrolledCourses([]);
                toast.success("Logged out successfully");
                navigate("/");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to logout");
        }
    };

    const sendPhoneOtp = async (payload) => {
        const { data } = await api.post("/api/auth/send-phone-otp", payload);
        return data;
    };

    const verifyPhoneOtp = async (payload) => {
        const { data } = await api.post("/api/auth/verify-phone-otp", payload);
        if (data.success) {
            setUserData(data.user);
            setIsEducator(data.user.role === "educator");
        }
        return data;
    };

    const forgotPassword = async (payload) => {
        const { data } = await api.post("/api/auth/forgot-password", payload);
        return data;
    };

    const resetPassword = async (payload) => {
        const { data } = await api.post("/api/auth/reset-password", payload);
        return data;
    };

    const fetchAllCourses = async () => {
        try {
            setCoursesLoading(true);
            const { data } = await api.get("/api/course/all");
            if (data.success) {
                setAllCourses(data.courses || []);
            } else {
                toast.error(data.message);
                setAllCourses([]);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || error.message);
            }
            setAllCourses([]);
        } finally {
            setCoursesLoading(false);
        }
    };

    const fetchEnrolledCourses = async () => {
        if (!userData) {
            setenrolledCourses([]);
            return;
        }

        try {
            const { data } = await api.get("/api/user/data/enrolled-courses");
            if (data.success) {
                const courses = data.enrolledCourses || [];
                setenrolledCourses([...courses].reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || error.message);
            }
            setenrolledCourses([]);
        }
    };

    const generateCertificate = async (courseId) => {
        try {
            const { data } = await api.post(`/api/user/generate-certificate/${courseId}`, {});
            if (data.success) {
                toast.success(data.message);
                return data.certificate;
            }
            toast.error(data.message);
            return null;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return null;
        }
    };

    const fetchCourseExam = async (courseId) => {
        try {
            const { data } = await api.get(`/api/course/${courseId}`);
            if (data.success) return data.exam || null;
            return null;
        } catch {
            return null;
        }
    };

    const calculateRating = (course) => {
        if (!course.courseRatings || course.courseRatings.length === 0) return 0;
        const total = course.courseRatings.reduce((sum, item) => sum + item.rating, 0);
        return Math.floor(total / course.courseRatings.length);
    };

    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.forEach((lecture) => {
            time += lecture.lectureDuration;
        });
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    const calculateCourseDuration = (course) => {
        let total = 0;
        course.courseContent.forEach((chapter) => chapter.chapterContent.forEach((lecture) => {
            total += lecture.lectureDuration;
        }));
        return humanizeDuration(total * 60 * 1000, { units: ["h", "m"] });
    };

    const calculateNoofLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    };

    const getToken = async () => "cookie-auth";

    useEffect(() => {
        refreshUser();
    }, []);

    useEffect(() => {
        if (userData) {
            fetchEnrolledCourses();
        } else {
            setenrolledCourses([]);
        }
    }, [userData]);

    useEffect(() => {
        fetchAllCourses();
    }, []);

    const value = {
        currency,
        backendUrl,
        navigate,
        freeCoursesMode,
        userData,
        setUserData,
        authLoading,
        isAuthenticated,
        isEducator,
        setIsEducator,
        login,
        register,
        logout,
        sendPhoneOtp,
        verifyPhoneOtp,
        forgotPassword,
        resetPassword,
        refreshUser,
        fetchUserData: refreshUser,
        getToken,
        allCourses,
        coursesLoading,
        enrolledCourses,
        setenrolledCourses,
        fetchEnrolledCourses,
        fetchAllCourses,
        generateCertificate,
        fetchCourseExam,
        calculateRating,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoofLectures,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
