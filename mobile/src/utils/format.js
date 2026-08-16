// Shared formatting / data helpers that mirror the existing web client logic.

/**
 * Compute the average rating (0..5) for a course.
 * Mirrors the web client's calculateRating().
 */
export const averageRating = (course) => {
  if (!course || !Array.isArray(course.courseRatings) || course.courseRatings.length === 0) {
    return 0;
  }
  const total = course.courseRatings.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  return Math.round((total / course.courseRatings.length) * 10) / 10;
};

/**
 * Sum minutes and format as "Xh Ym".
 * Mirrors the web client's humanizeDuration-based helpers.
 */
export function formatMinutes(minutes) {
  const m = Math.round(Number(minutes) || 0);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

/** Total duration of a course (sum of lectures) formatted. */
export const courseDuration = (course) => {
  if (!course || !Array.isArray(course.courseContent)) return '0m';
  let total = 0;
  course.courseContent.forEach((chapter) => {
    if (Array.isArray(chapter.chapterContent)) {
      chapter.chapterContent.forEach((lecture) => {
        total += Number(lecture.lectureDuration) || 0;
      });
    }
  });
  return formatMinutes(total);
};

/** Total lecture count in a course. */
export const lectureCount = (course) => {
  if (!course || !Array.isArray(course.courseContent)) return 0;
  return course.courseContent.reduce(
    (count, chapter) =>
      count + (Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0),
    0
  );
};

/** Count of enrolled students. */
export const studentCount = (course) =>
  course && Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0;

/** Format a number with short suffixes (k). */
export function formatCount(num) {
  const n = Number(num) || 0;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${n}`;
}

/** Price display. */
export function formatPrice(currencySymbol, course) {
  if (!course) return '';
  const discounted = (Number(course.coursePrice) || 0) * (1 - (Number(course.discount) || 0) / 100);
  const discountedRounded = Math.round(discounted * 100) / 100;
  if (discountedRounded <= 0) return 'Free';
  return `${currencySymbol}${discountedRounded.toFixed(2)}`;
}

/** Progress percentage (0..100). */
export function progressPercent(completed, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

/**
 * Extract a YouTube video ID from a lecture URL.
 * Supports youtu.be/, youtube.com/watch?v=, /embed/, shorts, and raw IDs.
 */
export function getYouTubeVideoId(url = '') {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/.*[?&]v=([\w-]{11})/,
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match) return match[1];
  }
  // Raw ID
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

/** Flatten all lectures of a course into a single ordered array with chapter index. */
export function flattenLectures(course) {
  const out = [];
  if (!course || !Array.isArray(course.courseContent)) return out;
  course.courseContent.forEach((chapter, chapterIndex) => {
    if (Array.isArray(chapter.chapterContent)) {
      chapter.chapterContent.forEach((lecture, lectureIndex) => {
        out.push({ ...lecture, chapterIndex, lectureIndex });
      });
    }
  });
  return out;
}

/** Format an ISO date string nicely. */
export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}