import Course from "../models/Course.js";
import Exam from "../models/Exam.js";

//getAll Courses

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({isPublished:true}).select(['-courseContent','-enrolledStudents']).populate({path:'educator'})
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

//get Course bny id

export const getCourseId = async (req, res) => {
    const { id } = req.params;

    try {
        const courseData = await Course.findById(id).populate({
            path: "educator"
        });

        if (!courseData) {
            return res.json({
                success: false,
                message: "Course not found"
            });
        }

        const exam = await Exam.findOne({
            courseId: id,
            isPublished: true
        }).select(
            "title description passingScore timeLimit maxAttempts isPublished"
        );

        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            });
        });

        res.json({
            success: true,
            courseData,
            exam
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};