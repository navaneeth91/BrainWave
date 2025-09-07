import express from 'express'
import { addUserRating, getCourseProgress, getUserData, purchaseCourse, updateCourseProgress, userEnrolledCourses } from '../controllers/userController.js';

const userRouter = express.Router()

userRouter.get('/data', getUserData)
userRouter.get('/data/enrolled-courses', userEnrolledCourses);
userRouter.post('/purchase', purchaseCourse)
userRouter.post('/update-course-progress',updateCourseProgress)
userRouter.post('/get-course-progress',getCourseProgress)
userRouter.post('/add-user-rating',addUserRating)

export default userRouter;