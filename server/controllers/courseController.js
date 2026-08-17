import Course from "../models/Course.js";
import Exam from "../models/Exam.js";
import { v2 as cloudinary } from 'cloudinary';

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

// upload course video to Cloudinary (educator only)
export const uploadCourseVideo = async (req, res) => {
    try {
        const videoFile = req.file;

        if (!videoFile) {
            return res.status(400).json({ success: false, message: 'No video file provided' });
        }

        // Upload the in-memory buffer straight to Cloudinary.
        // Videos are never stored on the local server.
        const result = await cloudinary.uploader.upload(
            `data:${videoFile.mimetype};base64,${videoFile.buffer.toString('base64')}`,
            {
                resource_type: 'video',
                folder: 'brainwave/course-videos',
                use_filename: true,
                unique_filename: true,
            }
        );

        res.json({
            success: true,
            message: 'Video uploaded successfully',
            video: {
                url: result.secure_url,
                publicId: result.public_id,
                duration: result.duration || 0,
                format: result.format || '',
                bytes: result.bytes || 0,
                public_id: result.public_id,
            }
        });

    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({ success: false, message: 'Video upload failed. Please try again.' });
    }
};

// delete a Cloudinary video (educator only, ownership-aware)
export const deleteCourseVideo = async (req, res) => {
    try {
        const { publicId } = req.body;
        const educatorId = req.auth?.userId;

        if (!publicId) {
            return res.status(400).json({ success: false, message: 'Video public ID is required' });
        }

        // Refuse to delete a video that is still referenced by another
        // educator's saved course.
        const referencingCourses = await Course.find({
            'courseContent.chapterContent.lecturePublicId': publicId,
        }).select('educator courseTitle');

        const foreignReference = referencingCourses.find(
            (course) => course.educator.toString() !== educatorId
        );

        if (foreignReference) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete this video as it is used by another educator\'s course',
            });
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video',
        });

        res.json({
            success: true,
            message: 'Video deleted successfully',
            result,
        });

    } catch (error) {
        console.error('Video delete error:', error);
        res.status(500).json({ success: false, message: 'Video deletion failed. Please try again.' });
    }
};