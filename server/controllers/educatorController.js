import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import { getIdentityCandidates } from "../utils/authIdentity.js";

export const updateRoleToEducator = async (req, res) => {
    try {
        const user = req.auth.user;
        user.role = "educator";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "You can publish a course now",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Thumbnail not attached" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = educatorId;
        parsedCourseData.courseThumbnail = imageUpload.secure_url;

        await Course.create(parsedCourseData);
        return res.status(201).json({ success: true, message: "Course added" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getEducatorCourses = async (req, res) => {
    try {
        const candidates = getIdentityCandidates(req.auth.user);
        const courses = await Course.find({ educator: { $in: candidates } });
        return res.status(200).json({ success: true, courses });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const educatorDashboardData = async (req, res) => {
    try {
        const candidates = getIdentityCandidates(req.auth.user);
        const courses = await Course.find({ educator: { $in: candidates } });
        const totalCourses = courses.length;
        const courseIds = courses.map((course) => course._id);
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: "Completed",
        });
        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents },
            }, "name imageUrl");

            students.forEach((student) => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student,
                });
            });
        }

        return res.status(200).json({
            success: true,
            dashboardData: {
                totalCourses,
                totalEarnings,
                enrolledStudentsData,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getEnrolledStudentsData = async (req, res) => {
    try {
        const candidates = getIdentityCandidates(req.auth.user);
        const courses = await Course.find({ educator: { $in: candidates } });
        const courseIds = courses.map((course) => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: "Completed",
        }).populate("userId", "name imageUrl").populate("courseId", "courseTitle");

        const enrolledStudents = purchases.map((purchase) => ({
            student: purchase.userId,
            courseTitle: purchase.courseId?.courseTitle,
            purchaseDate: purchase.createdAt,
        }));

        return res.status(200).json({ success: true, enrolledStudents });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
