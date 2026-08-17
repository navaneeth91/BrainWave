// ---------------------------------------------------------------------------
// aiController.js
// Handles authentication, request validation, course retrieval, enrollment
// verification and logging for the AI assistant. The Gemini call itself is
// delegated to services/aiService.js.
// ---------------------------------------------------------------------------

import Course from '../models/Course.js';
import User from '../models/User.js';
import { buildCourseContext } from '../services/courseContext.js';
import { generateLearningAssistantResponse } from '../services/aiService.js';

const MAX_MESSAGE_LENGTH = parseInt(
  process.env.AI_MAX_MESSAGE_LENGTH || '2000',
  10
);
const MAX_CONVERSATION_MESSAGES = parseInt(
  process.env.AI_MAX_CONVERSATION_MESSAGES || '15',
  10
);

/**
 * Sanitizes the conversation history the frontend sends.
 * - only accepts user/assistant roles
 * - only accepts string content
 * - truncates each message to the max message length
 * - keeps only the most recent N messages
 */
const sanitizeConversation = (conversation) => {
  if (!Array.isArray(conversation)) return [];
  return conversation
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .slice(-MAX_CONVERSATION_MESSAGES);
};

/**
 * Finds a lecture inside a course document and returns the lecture plus the
 * title of the chapter it belongs to.
 */
const findLectureInCourse = (course, lectureId) => {
  if (!course?.courseContent) return null;

  for (const chapter of course.courseContent) {
    const lecture = (chapter.chapterContent || []).find(
      (l) => l.lectureId === lectureId
    );
    if (lecture) {
      return {
        lecture,
        chapterTitle: chapter.chapterTitle,
        duration: lecture.lectureDuration,
      };
    }
  }
  return null;
};
// POST /api/ai/chat
export const aiChat = async (req, res) => {
  const startTime = Date.now();
  const userId = req.auth?.userId;
  const { courseId, lectureId, message, conversation } =
    req.body || {};

  // 1. Authentication (reuses the global Clerk middleware)
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized. Please login.' });
  }

  // 2. Request validation
  if (!courseId || typeof courseId !== 'string') {
    return res
      .status(400)
      .json({ success: false, message: 'Course ID is required.' });
  }

  if (!lectureId || typeof lectureId !== 'string') {
    return res
      .status(400)
      .json({ success: false, message: 'Lecture ID is required.' });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res
      .status(400)
      .json({ success: false, message: 'Message cannot be empty.' });
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message is too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  const cleanMessage = message.trim();
  const cleanConversation = sanitizeConversation(conversation);

  console.log(
    `[BrainWave AI] Request started | userId=${userId} | courseId=${courseId} | lectureId=${lectureId} | messageChars=${cleanMessage.length} | historyTurns=${cleanConversation.length}`
  );

  try {
    // 3. Course retrieval
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found.' });
    }

    // 4. Enrollment verification (identity from the authenticated
    //    request — never from the client body)
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found. Please login again.' });
    }

    const enrolledViaUser = (user.enrolledCourses || []).some(
      (id) => id && id.toString() === courseId
    );
    const enrolledViaCourse = (course.enrolledStudents || []).some(
      (id) => id && id.toString() === userId
    );

    if (!enrolledViaUser && !enrolledViaCourse) {
      console.log(
        `[BrainWave AI] Enrollment rejected | userId=${userId} | courseId=${courseId}`
      );
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to use BrainWave AI.',
      });
    }

    // 5. Lecture lookup
    const currentLectureData = findLectureInCourse(course, lectureId);
    if (!currentLectureData) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found in this course.',
      });
    }

    // 6. Build clean context + call the AI service
    const courseContext = buildCourseContext(course);
    const currentLecture = {
      chapterTitle: currentLectureData.chapterTitle,
      lectureTitle: currentLectureData.lecture.lectureTitle,
      description: '',
      duration: currentLectureData.duration,
    };

    const reply = await generateLearningAssistantResponse({
      courseContext,
      currentLecture,
      message: cleanMessage,
      conversation: cleanConversation,
    });

    console.log(
      `[BrainWave AI] Success | userId=${userId} | courseId=${courseId} | lectureId=${lectureId} | durationMs=${Date.now() - startTime} | replyChars=${reply.length}`
    );

    return res.json({ success: true, reply });
  } catch (error) {
    // 7. Error mapping — never expose internal details
    const statusCode =
      error && (error.status === 429 || error.code === '429') ? 429 : 500;
    const friendlyMessage =
      statusCode === 429
        ? 'BrainWave AI is busy right now. Please try again in a moment.'
        : "Sorry, BrainWave AI couldn't respond right now. Please try again.";

    console.error(
      `[BrainWave AI] Failed | userId=${userId} | courseId=${courseId} | lectureId=${lectureId} | durationMs=${Date.now() - startTime} | reason=${error?.message || 'Unknown error'}`
    );

    return res.status(statusCode).json({
      success: false,
      message: friendlyMessage,
    });
  }
};

