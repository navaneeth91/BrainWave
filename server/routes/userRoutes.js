import express from 'express'
import {
    addUserRating,
    getCourseProgress,
    getUserData,
    purchaseCourse,
    updateCourseProgress,
    userEnrolledCourses,
    generateCertificate,
    getCertificate,
    getUserCertificates,
    getCertificateById,
    verifyCertificate
} from '../controllers/userController.js';
const userRouter = express.Router()

userRouter.get('/data', getUserData)
userRouter.get('/data/enrolled-courses', userEnrolledCourses);
userRouter.post('/purchase', purchaseCourse)
userRouter.post('/update-course-progress',updateCourseProgress)
userRouter.post(
    '/generate-certificate/:courseId',
    generateCertificate
);
userRouter.get(
    '/verify-certificate/:certificateId',
    verifyCertificate
);
userRouter.get(
    '/certificate/course/:courseId',
    getCertificate
);

userRouter.get(
    '/certificate/:certificateId',
    getCertificateById
);

userRouter.get(
    '/certificates',
    getUserCertificates
);
userRouter.get(
    "/course-progress/:courseId",
    getCourseProgress
);

userRouter.post('/add-user-rating',addUserRating)

export default userRouter;