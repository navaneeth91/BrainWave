import express from "express";
import { addCourse, getEducatorCourses,educatorDashboardData, getEnrolledStudentsData,updateRoleToEducator } from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";

const eductaorRouter=express.Router()

//add educator role

eductaorRouter.post('/update-role',updateRoleToEducator)
eductaorRouter.post('/add-course',upload.single('image'),protectEducator,addCourse)
eductaorRouter.get('/courses',protectEducator,getEducatorCourses)
eductaorRouter.get('/dashboard',protectEducator,educatorDashboardData)
eductaorRouter.get('/enrolled-students',protectEducator,getEnrolledStudentsData)
export default eductaorRouter;