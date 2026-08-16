import express from "express";

import {
    addCourse,
    getEducatorCourses,
    educatorDashboardData,
    getEnrolledStudentsData,
    updateRoleToEducator,
} from "../controllers/educatorController.js";

import upload from "../configs/multer.js";

import {
    protect,
    protectEducator,
} from "../middlewares/authMiddleware.js";


const eductaorRouter = express.Router();


// ==========================================
// BECOME EDUCATOR
// ==========================================

eductaorRouter.post(
    "/update-role",
    protect,
    updateRoleToEducator
);


// ==========================================
// ADD COURSE
// ==========================================

eductaorRouter.post(
    "/add-course",
    protect,
    protectEducator,
    upload.single("courseThumbnail"),
    addCourse
);


// ==========================================
// EDUCATOR COURSES
// ==========================================

eductaorRouter.get(
    "/courses",
    protect,
    protectEducator,
    getEducatorCourses
);


// ==========================================
// EDUCATOR DASHBOARD
// ==========================================

eductaorRouter.get(
    "/dashboard",
    protect,
    protectEducator,
    educatorDashboardData
);


// ==========================================
// ENROLLED STUDENTS
// ==========================================

eductaorRouter.get(
    "/enrolled-students",
    protect,
    protectEducator,
    getEnrolledStudentsData
);


export default eductaorRouter;