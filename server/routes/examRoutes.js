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

import { protectEducator } from "../middlewares/authMiddleware.js";

const examRouter = express.Router();


// Educator: Create exam
examRouter.post(
  "/create",
  protectEducator,
  createExam
);


// Educator: Add question
examRouter.post(
  "/question",
  protectEducator,
  addExamQuestion
);
// Educator: Get exam
examRouter.get(
  "/educator/:examId",
  protectEducator,
  getExamForEducator
);
// Student: Get exam for a course
examRouter.get(
  "/course/:courseId",
  getExamByCourse
);

// Educator: Get all exams
examRouter.get(
  "/educator",
  protectEducator,
  getEducatorExams
);

// Student: Start exam
examRouter.post(
  "/:examId/start",
  startExam
);
// Student: Get individual exam result
examRouter.get(
  "/attempt/:attemptId",
  getExamAttemptResult
);
// Student: Get own exam attempts
examRouter.get(
  "/:examId/attempts",
  getMyExamAttempts
);
// Student: Get exam
examRouter.get(
  "/:examId",
  getExamForStudent
);
// Educator: Update question
examRouter.put(
  "/question/:questionId",
  protectEducator,
  updateExamQuestion
);

// Educator: Delete question
examRouter.delete(
  "/question/:questionId",
  protectEducator,
  deleteExamQuestion
);
// Educator: Publish / unpublish exam
examRouter.patch(
  "/:examId/publish",
  protectEducator,
  toggleExamPublish
);
// Student: Submit exam
examRouter.post(
  "/:examId/submit",
  submitExam
);

export default examRouter;