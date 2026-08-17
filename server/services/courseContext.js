// ---------------------------------------------------------------------------
// courseContext.js
// Builds a clean, minimal learning context object from the MongoDB Course
// document so the AI service never receives unnecessary/private fields
// (no enrolledStudents, no ratings, no educator metadata, no URLs, no ids
// except the ones useful for identification).
// ---------------------------------------------------------------------------

// Maximum total characters the course-curriculum section may use in the
// prompt. The current lecture always fits first (small), then the course
// overview, then the chapter/lecture outline is truncated to fit.
const MAX_CONTEXT_CHARS = parseInt(
  process.env.AI_MAX_CONTEXT_CHARS || '12000',
  10
);

// Course descriptions are stored as Quill HTML. Convert to plain text so the
// model only sees readable learning material.
const stripHtmlToText = (html = '') =>
  String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|ul|ol|blockquote|section)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const truncateText = (text, maxChars) => {
  if (!text) return text;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1).trimEnd() + '…';
};

/**
 * @param {import('mongoose').Model} course - The Course document
 * @returns {{ courseId, courseTitle, courseDescription, chapters }}
 */
export const buildCourseContext = (course) => {
  const chapters = (course.courseContent || [])
    .slice()
    .sort((a, b) => (a.chapterOrder ?? 0) - (b.chapterOrder ?? 0))
    .map((chapter) => ({
      chapterId: chapter.chapterId,
      chapterOrder: chapter.chapterOrder,
      title: chapter.chapterTitle,
      lectures: (chapter.chapterContent || [])
        .slice()
        .sort((a, b) => (a.lectureOrder ?? 0) - (b.lectureOrder ?? 0))
        .map((lecture) => ({
          lectureId: lecture.lectureId,
          title: lecture.lectureTitle,
          duration: lecture.lectureDuration,
        })),
    }));

  return {
    courseId: course._id.toString(),
    courseTitle: course.courseTitle,
    courseDescription: truncateText(
      stripHtmlToText(course.courseDescription),
      2500
    ),
    chapters,
  };
};

/**
 * Converts the clean context objects into the textual prompt section that is
 * appended to the system instruction. The current lecture is placed first
 * (highest priority), then the course overview, then the curriculum outline
 * truncated to a sensible character budget.
 */
export const buildLearningContextPrompt = (courseContext, currentLecture) => {
  // --- Build the CURRENT LECTURE block ---
  const currentLectureLines = [
    '=== CURRENT LECTURE (highest priority) ===',
    `Chapter: ${currentLecture.chapterTitle || '—'}`,
    `Lecture Title: ${currentLecture.lectureTitle || '—'}`,
    `Lecture Duration: ${
      currentLecture.duration
        ? `${currentLecture.duration} minute(s)`
        : 'not specified'
    }`,
  ];

  // Include transcript if available and non-empty.
  const transcript = currentLecture.transcript || '';
  if (transcript) {
    // Truncate transcript to a reasonable chunk so it always fits.
    const maxTranscriptChars = 3000; // generous but bounded
    const truncatedTranscript = transcript.length > maxTranscriptChars
      ? transcript.slice(0, maxTranscriptChars - 1).trimEnd() + '…'
      : transcript;
    currentLectureLines.push(
      `Lecture Transcript: ${truncatedTranscript}`
    );
  }

  if (!transcript) {
    if (currentLecture.description) {
      currentLectureLines.push(
        `Lecture Description: ${currentLecture.description}`
      );
    }
  }

  const lines = [
    '=== COURSE MATERIAL (primary source of truth) ===',
    `Course Title: ${courseContext.courseTitle || '—'}`,
  ];
  if (courseContext.courseDescription) {
    lines.push(
      `Course Description: ${courseContext.courseDescription}`
    );
  }
  lines.push('', 'Course Curriculum:');

  let budget = MAX_CONTEXT_CHARS;
  for (const chapter of courseContext.chapters || []) {
    const chapterLine = `${chapter.chapterOrder ?? ''}${
      chapter.chapterOrder ? '. ' : ''
    }Chapter: ${chapter.title || 'Untitled'}`;
    budget -= chapterLine.length + 1;
    if (budget < 0) break;
    lines.push(chapterLine);

    for (const lecture of chapter.lectures || []) {
      const lectureLine = `   - ${lecture.title || 'Untitled lecture'}${
        lecture.duration ? ` (${lecture.duration} min)` : ''
      }`;
      budget -= lectureLine.length + 1;
      if (budget < 0) {
        lines.push('   - (further lectures omitted to fit context limits)');
        break;
      }
      lines.push(lectureLine);
    }
  }

  return currentLectureLines.join('\n') + '\n\n' + lines.join('\n');
};
