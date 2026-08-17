import express from 'express'
import { getAllCourses, getCourseId, uploadCourseVideo, deleteCourseVideo } from '../controllers/courseController.js'
import { videoUpload } from '../configs/multer.js'
import { protectEducator } from '../middlewares/authMiddleware.js'

const courseRouter =express.Router()

courseRouter.get('/all',getAllCourses);
courseRouter.get('/:id',getCourseId)

// Helper that runs multer and forwards any upload error as a clean JSON response.
const handleVideoUpload = (req, res, next) => {
    videoUpload.single('video')(req, res, (err) => {
        if (!err) return next();

        let message = 'Video upload failed';
        let status = 500;

        if (err.code === 'LIMIT_FILE_SIZE') {
            status = 413;
            message = 'Video file is too large. Maximum size is 500 MB.';
        } else if (err.status === 400) {
            status = 400;
            message = err.message;
        }

        return res.status(status).json({ success: false, message });
    });
};

courseRouter.post('/upload-video', handleVideoUpload, protectEducator, uploadCourseVideo);
courseRouter.post('/delete-video', express.json({ limit: '1mb' }), protectEducator, deleteCourseVideo);

export default courseRouter