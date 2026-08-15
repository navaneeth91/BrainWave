import Exam from "../models/Exam.js";
import ExamQuestion from "../models/ExamQuestion.js";
import ExamAttempt from "../models/ExamAttempt.js";
import User from "../models/User.js";
import CourseProgress from "../models/CourseProgress.js";
import Course from "../models/Course.js";

const verifyExamOwnership = async (examId, educatorId) => {
  const exam = await Exam.findById(examId);

  if (!exam) {
    return {
      exam: null,
      error: {
        status: 404,
        message: "Exam not found",
      },
    };
  }

  if (exam.educatorId !== educatorId) {
    return {
      exam: null,
      error: {
        status: 403,
        message: "You are not authorized to manage this exam",
      },
    };
  }

  return {
    exam,
    error: null,
  };
};

// Start an exam attempt
export const startExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find exam
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Exam must be published
    if (!exam.isPublished) {
      return res.status(403).json({
        success: false,
        message: "This exam is not available yet",
      });
    }

    // Check user
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check enrollment
    const isEnrolled = user.enrolledCourses?.some(
      (id) =>
        id.toString() === exam.courseId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Course must be completed
    const progress = await CourseProgress.findOne({
      userId,
      courseId: exam.courseId,
    });

    if (!progress || !progress.completed) {
      return res.status(403).json({
        success: false,
        message:
          "Complete the course before taking the final exam",
      });
    }

    // Check previous attempts
    const previousAttempts =
      await ExamAttempt.countDocuments({
        examId,
        userId,
      });

    if (previousAttempts >= exam.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts reached. You can only attempt this exam ${exam.maxAttempts} times.`,
      });
    }

    // Check if there is already an unfinished attempt
    const existingAttempt =
      await ExamAttempt.findOne({
        examId,
        userId,
        completedAt: null,
      }).sort({ startedAt: -1 });

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        message: "Existing exam attempt resumed",
        attempt: {
          attemptId: existingAttempt._id,
          startedAt: existingAttempt.startedAt,
          timeLimit: exam.timeLimit,
          attemptNumber: previousAttempts,
        },
      });
    }

    // Create new attempt
    const startedAt = new Date();

    const attempt = await ExamAttempt.create({
      examId,
      userId,
      answers: [],
      score: 0,
      totalMarks: 0,
      percentage: 0,
      passed: false,
      startedAt,
      completedAt: null,
    });

    res.status(201).json({
      success: true,
      message: "Exam started successfully",
      attempt: {
        attemptId: attempt._id,
        startedAt: attempt.startedAt,
        timeLimit: exam.timeLimit,
        attemptNumber: previousAttempts + 1,
      },
    });

  } catch (error) {
    console.error("Start exam error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const createExam = async (req, res) => {
  try {
    const educatorId = req.auth?.userId;

    if (!educatorId) {
      return res.status(401).json({
        success: false,
        message: "Educator not authenticated",
      });
    }

const {
  courseId,
  title,
  description,
  passingScore,
  timeLimit,
  maxAttempts,
} = req.body || {};

    if (!courseId || !title) {
      return res.status(400).json({
        success: false,
        message: "Course ID and exam title are required",
      });
    }

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.educator !== educatorId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create an exam for this course",
      });
    }

    const existingExam = await Exam.findOne({
      courseId,
    });

    if (existingExam) {
      return res.status(400).json({
        success: false,
        message: "An exam already exists for this course",
      });
    }

    const exam = await Exam.create({
      courseId,
      educatorId,
      title,
      description,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 30,
      maxAttempts: maxAttempts || 3,
    });

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    console.error("Create exam error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Add a question to an exam
export const addExamQuestion = async (req, res) => {
  try {
    const {
      examId,
      questionText,
      options,
      correctAnswer,
      marks,
      order,
    } = req.body;

    if (
      !examId ||
      !questionText ||
      !options ||
      !correctAnswer ||
      !order
    ) {
      return res.status(400).json({
        success: false,
        message: "All required question fields must be provided",
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }
    const educatorId = req.auth?.userId;

    if (!educatorId) {
    return res.status(401).json({
        success: false,
        message: "Educator not authenticated",
    });
    }

    if (exam.educatorId !== educatorId) {
    return res.status(403).json({
        success: false,
        message: "You are not authorized to add questions to this exam",
    });
    }
    const question = await ExamQuestion.create({
      examId,
      questionText,
      options,
      correctAnswer,
      marks: marks || 1,
      order,
    });

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      question,
    });
  } catch (error) {
    console.error("Add exam question error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get exam for a student
// IMPORTANT: correctAnswer is excluded
export const getExamForStudent = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }
    if (!exam.isPublished) {
        return res.status(403).json({
            success: false,
            message: "This exam is not available yet",
        });
    }
    const userId = req.auth?.userId;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    const isEnrolled = user.enrolledCourses?.some(
     (id) => id.toString() === exam.courseId.toString()
    );

    if (!isEnrolled) {
        return res.status(403).json({
            success: false,
            message: "You are not enrolled in this course",
        });
    }
    const questions = await ExamQuestion.find({
      examId,
    })
      .select("-correctAnswer")
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      exam,
      questions,
    });
  } catch (error) {
    console.error("Get exam error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Submit exam and calculate result
export const submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { attemptId, answers } = req.body;
    const userId = req.auth?.userId;

    // =========================
    // AUTHENTICATION
    // =========================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // =========================
    // VALIDATE REQUEST
    // =========================

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Exam attempt is required",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    // =========================
    // FIND EXAM
    // =========================

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // =========================
    // FIND ATTEMPT
    // =========================

    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      examId,
      userId,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found",
      });
    }

    // =========================
    // ALREADY SUBMITTED
    // =========================

    if (attempt.completedAt) {
      return res.status(400).json({
        success: false,
        message: "This exam attempt has already been submitted",
      });
    }

    // =========================
    // CHECK TIME
    // =========================

    const startedAt = new Date(attempt.startedAt);
    const now = new Date();

    const elapsedSeconds = Math.floor(
      (now.getTime() - startedAt.getTime()) / 1000
    );

    const allowedSeconds = Number(exam.timeLimit) * 60;

    const timeExpired =
      elapsedSeconds > allowedSeconds;

    // =========================
    // GET QUESTIONS
    // =========================

    const questions = await ExamQuestion.find({
      examId,
    })
      .sort({ order: 1 })
      .lean();

    if (!questions.length) {
      return res.status(400).json({
        success: false,
        message: "No questions found for this exam",
      });
    }

    // =========================
    // CREATE ANSWER MAP
    // =========================

    const answerMap = new Map();

    answers.forEach((answer) => {
      if (
        answer &&
        answer.questionId &&
        answer.selectedOption !== undefined &&
        answer.selectedOption !== null
      ) {
        answerMap.set(
          answer.questionId.toString(),
          Number(answer.selectedOption)
        );
      }
    });

    // =========================
    // GRADE EXAM
    // =========================

    let score = 0;
    let totalMarks = 0;

    const savedAnswers = [];

    questions.forEach((question) => {
      const questionId =
        question._id.toString();

      const selectedOption =
        answerMap.has(questionId)
          ? answerMap.get(questionId)
          : -1;

      const correctAnswer =
        Number(question.correctAnswer);

      const marks =
        Number(question.marks) || 1;

      const isCorrect =
        selectedOption === correctAnswer;

      totalMarks += marks;

      if (isCorrect) {
        score += marks;
      }

      savedAnswers.push({
        questionId: question._id,
        selectedOption,
        isCorrect,
      });

      // Debugging
      console.log({
        questionId,
        selectedOption,
        correctAnswer,
        marks,
        isCorrect,
      });
    });

    // =========================
    // CALCULATE PERCENTAGE
    // =========================

    const percentage =
      totalMarks > 0
        ? Number(
            ((score / totalMarks) * 100).toFixed(2)
          )
        : 0;

    // =========================
    // PASS / FAIL
    // =========================

    const passingScore =
      Number(exam.passingScore) || 70;

    const passed =
      !timeExpired &&
      percentage >= passingScore;

    // =========================
    // SAVE ATTEMPT
    // =========================

    attempt.answers = savedAnswers;
    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.completedAt = now;

    await attempt.save();

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,

      message: timeExpired
        ? "Time expired. Your exam has been submitted."
        : "Exam submitted successfully",

      result: {
        attemptId: attempt._id,
        examId: exam._id,

        score,
        totalMarks,
        percentage,

        passingScore,

        passed,
        timeExpired,

        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
      },
    });

  } catch (error) {
    console.error(
      "Submit exam error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get exam for educator
export const getExamForEducator = async (req, res) => {
  try {
    const { examId } = req.params;
    const educatorId = req.auth?.userId;

    if (!educatorId) {
        return res.status(401).json({
            success: false,
            message: "Educator not authenticated",
        });
    }

    const { exam, error } = await verifyExamOwnership(
        examId,
        educatorId
    );

    if (error) {
        return res.status(error.status).json({
            success: false,
            message: error.message,
        });
    }

    const questions = await ExamQuestion.find({
      examId,
    })
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      exam,
      questions,
    });
  } catch (error) {
    console.error("Get educator exam error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update an exam question
export const updateExamQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const {
      questionText,
      options,
      correctAnswer,
      marks,
      order,
    } = req.body;

    const question = await ExamQuestion.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    const { exam, error } = await verifyExamOwnership(
    examId,
    educatorId
    );

    if (error) {
    return res.status(error.status).json({
        success: false,
        message: error.message,
    });
    }

    if (questionText !== undefined) {
      question.questionText = questionText;
    }

    if (options !== undefined) {
      question.options = options;
    }

    if (correctAnswer !== undefined) {
      question.correctAnswer = correctAnswer;
    }

    if (marks !== undefined) {
      question.marks = marks;
    }

    if (order !== undefined) {
      question.order = order;
    }

    await question.save();

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.error("Update exam question error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete an exam question
export const deleteExamQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await ExamQuestion.findById(questionId);
    const educatorId = req.auth?.userId;

    if (!educatorId) {
    return res.status(401).json({
        success: false,
        message: "Educator not authenticated",
    });
    }

    const { exam, error } = await verifyExamOwnership(
    question.examId,
    educatorId
    );

    if (error) {
    return res.status(error.status).json({
        success: false,
        message: error.message,
    });
    }
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    await ExamQuestion.findByIdAndDelete(questionId);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete exam question error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Publish or unpublish an exam
export const toggleExamPublish = async (req, res) => {
  try {
    const { examId } = req.params;
    const educatorId = req.auth?.userId;

    if (!educatorId) {
        return res.status(401).json({
            success: false,
            message: "Educator not authenticated",
        });
    }
    const { exam, error } = await verifyExamOwnership(
        examId,
        educatorId
    );

    if (error) {
        return res.status(error.status).json({
            success: false,
            message: error.message,
        });
    }

    exam.isPublished = !exam.isPublished;

    await exam.save();

    res.status(200).json({
      success: true,
      message: exam.isPublished
        ? "Exam published successfully"
        : "Exam unpublished successfully",
      isPublished: exam.isPublished,
    });
  } catch (error) {
    console.error("Toggle exam publish error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get exam for a course
export const getExamByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const exam = await Exam.findOne({
      courseId,
    }).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "No exam found for this course",
      });
    }

    return res.status(200).json({
      success: true,
      exam,
    });

  } catch (error) {
    console.error(
      "Get exam by course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get student's exam attempts
export const getMyExamAttempts = async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const exam = await Exam.findById(examId).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const attempts = await ExamAttempt.find({
      examId,
      userId,
    })
      .select("-answers")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      attempts,
    });
  } catch (error) {
    console.error("Get exam attempts error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all exams created for educator's courses
export const getEducatorExams = async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

  const educatorId = req.auth?.userId;

    if (!educatorId) {
        return res.status(401).json({
            success: false,
            message: "Educator not authenticated",
        });
    }

    const exams = await Exam.find({
     educatorId,
    })
    .populate("courseId", "courseTitle courseThumbnail")
    .sort({ createdAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      exams,
    });
  } catch (error) {
    console.error("Get educator exams error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get a single exam attempt result
export const getExamAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      userId,
    })
      .populate(
  "examId",
  "title passingScore timeLimit courseId"
)
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found",
      });
    }

    return res.status(200).json({
      success: true,
      attempt: {
        _id: attempt._id,
        examId: attempt.examId?._id,
        courseId: attempt.examId?.courseId,
        examTitle: attempt.examId?.title,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        passingScore: attempt.examId?.passingScore,
        passed: attempt.passed,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        timeExpired: false,
      },
    });
  } catch (error) {
    console.error(
      "Get exam attempt result error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};