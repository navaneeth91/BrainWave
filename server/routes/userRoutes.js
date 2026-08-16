import express from "express";

import {
    getUserData,
    userEnrolledCourses,
    purchaseCourse,
    updateCourseProgress,
    getCourseProgress,
    addUserRating,
    generateCertificate,
    getCertificate,
    getUserCertificates,
    getCertificateById,
    verifyCertificate,
} from "../controllers/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();


// =====================================================
// USER
// =====================================================

userRouter.get(
    "/data",
    protect,
    getUserData
);

userRouter.get(
    "/data/enrolled-courses",
    protect,
    userEnrolledCourses
);


// =====================================================
// PURCHASE
// =====================================================

userRouter.post(
    "/purchase",
    protect,
    purchaseCourse
);


// =====================================================
// COURSE PROGRESS
// =====================================================

userRouter.post(
    "/update-course-progress",
    protect,
    updateCourseProgress
);

userRouter.get(
    "/course-progress/:courseId",
    protect,
    getCourseProgress
);


// =====================================================
// RATINGS
// =====================================================

userRouter.post(
    "/add-rating",
    protect,
    addUserRating
);


// =====================================================
// CERTIFICATES
// =====================================================

userRouter.post(
    "/generate-certificate/:courseId",
    protect,
    generateCertificate
);

userRouter.get(
    "/certificate/:courseId",
    protect,
    getCertificate
);

userRouter.get(
    "/certificates",
    protect,
    getUserCertificates
);

userRouter.get(
    "/certificate-by-id/:certificateId",
    protect,
    getCertificateById
);


// =====================================================
// PUBLIC CERTIFICATE VERIFICATION
// =====================================================

userRouter.get(
    "/verify-certificate/:certificateId",
    verifyCertificate
);


export default userRouter;