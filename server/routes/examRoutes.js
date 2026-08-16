import express from "express";

import {
  createExam,
  addExamQuestion,
  getExamForStudent,
  getExamForEducator,
  updateExamQuestion,
  deleteExamQuestion,
  toggleExamPublish,
  submitExam,
  startExam,
  getMyExamAttempts,
  getEducatorExams,
  getExamAttemptResult,
  getExamByCourse,
} from "../controllers/examController.js";

import { protect, protectEducator } from "../middlewares/authMiddleware.js";

const examRouter = express.Router();


// Educator: Create exam
examRouter.post(
  "/create",
  protect,
  protectEducator,
  createExam
);


// Educator: Add question
examRouter.post(
  "/question",
  protect,
  protectEducator,
  addExamQuestion
);
// Educator: Get exam
examRouter.get(
  "/educator/:examId",
  protect,
  protectEducator,
  getExamForEducator
);
// Student: Get exam for a course
examRouter.get(
  "/course/:courseId",
  protect,
  getExamByCourse
);

// Educator: Get all exams
examRouter.get(
  "/educator",
  protect,
  protectEducator,
  getEducatorExams
);

// Student: Start exam
examRouter.post(
  "/:examId/start",
  protect,
  startExam
);
// Student: Get individual exam result
examRouter.get(
  "/attempt/:attemptId",
  protect,
  getExamAttemptResult
);
// Student: Get own exam attempts
examRouter.get(
  "/:examId/attempts",
  protect,
  getMyExamAttempts
);
// Student: Get exam
examRouter.get(
  "/:examId",
  protect,
  getExamForStudent
);
// Educator: Update question
examRouter.put(
  "/question/:questionId",
  protect,
  protectEducator,
  updateExamQuestion
);

// Educator: Delete question
examRouter.delete(
  "/question/:questionId",
  protect,
  protectEducator,
  deleteExamQuestion
);
// Educator: Publish / unpublish exam
examRouter.patch(
  "/:examId/publish",
  protect,
  protectEducator,
  toggleExamPublish
);
// Student: Submit exam
examRouter.post(
  "/:examId/submit",
  protect,
  submitExam
);

export default examRouter;