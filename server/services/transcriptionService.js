// ---------------------------------------------------------------------------
// transcriptionService.js
// Node.js wrapper around the local Python transcription service.
// ---------------------------------------------------------------------------

import Course from '../models/Course.js';
import User from '../models/User.js';

// ---------- Configuration ----------
const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL || 'http://127.0.0.1:8001';

// ---------- In-memory job guard ----------
// key = lectureId (string)
// value = { createdAt, status, transcript?, language?, duration?, sourcePublicId? }
const jobQueue = new Map();

/**
 * Called by the educator flow before starting transcription.
 * Sets the job status to "processing" so duplicate starts are blocked.
 */
export const setTranscriptProcessing = (lectureId) => {
  if (!lectureId) return;
  const entry = jobQueue.get(lectureId);
  if (!entry || entry.status !== "not_started") return;
  entry.status = "processing";
  entry.createdAt = Date.now();
};

/**
 * Returns the current status object for a lecture.
 */
export const getTranscriptStatus = (lectureId) => {
  return jobQueue.get(lectureId) || { status: "not_started", lectureId };
};

/**
 * Enqueues a transcription job. If a job is already "processing" for the same
 * lectureId, returns early without starting a second job.
 */
export const scheduleLectureTranscript = async ({
  courseId,
  lectureId,
  videoUrl,
  sourcePublicId,
}) => {
  if (!lectureId) return;

  const existing = jobQueue.get(lectureId);
  if (existing && existing.status === "processing") {
    logger.info(
      `Transcription already processing for lectureId=${lectureId}; not duplicating.`
    );
    return;
  }

  // Mark as processing immediately (educator UI will poll this).
  jobQueue.set(lectureId, {
    createdAt: Date.now(),
    status: "processing",
    lectureId,
    sourcePublicId,
  });

  // Fire-and-forget the actual work.
  runTranscriptionJob({
    courseId,
    lectureId,
    videoUrl,
    sourcePublicId,
  }).catch((err) => {
    logger.error(`Transcription job failed: ${err.message}`);
    const entry = jobQueue.get(lectureId);
    if (entry) {
      entry.status = "failed";
      entry.transcriptError = err.message || "Unknown error";
      entry.transcriptionCompletedAt = new Date();
    }
  });
};

/**
 * Core job runner: calls the Python service, then persists the transcript to
 * the course document.  Updates the in-memory job queue on completion.
 */
async function runTranscriptionJob({
  courseId,
  lectureId,
  videoUrl,
  sourcePublicId,
}) {
  try {
    const fetch = globalThis.fetch;
    if (!fetch) throw new Error("globalThis.fetch is not available");

    const resp = await fetch(`${WHISPER_SERVICE_URL}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl }),
      timeout: 300000,
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Python service returned ${resp.status}: ${txt}`);
    }

    const data = await resp.json();
    if (!data.success) {
      throw new Error(data.detail || "Python service reported failure");
    }

    const { transcript, language, duration } = data;

    // Persist to MongoDB — update the specific lecture sub-document.
    // Use arrayFilters to match the lectureId inside chapterContent.
    await Course.updateOne(
      { _id: new courseId },
      {
        $set: {
          "courseContent.chapterContent.$[l].transcript": transcript,
          "courseContent.chapterContent.$[l].transcriptionStatus": "completed",
          "courseContent.chapterContent.$[l].transcriptionLanguage": language || "",
          "courseContent.chapterContent.$[l].transcriptionDuration": duration || 0,
          "courseContent.chapterContent.$[l].transcriptionSourcePublicId":
            sourcePublicId || "",
          "courseContent.chapterContent.$[l].transcriptionError": "",
          "courseContent.chapterContent.$[l].transcriptionCompletedAt": new Date(),
        },
      },
      {
        arrayFilters: [{ "l.lectureId": lectureId }],
      }
    );

    // Update the in-memory job queue to completed.
    const entry = jobQueue.get(lectureId);
    if (entry) {
      entry.status = "completed";
      entry.transcript = transcript;
      entry.language = language || "";
      entry.duration = duration || 0;
      entry.transcriptionCompletedAt = new Date();
      entry.transcriptError = "";
    }

    logger.info(
      `Transcription completed for lectureId=${lectureId} (${duration?.toFixed(1)}s)`
    );
    return { success: true };
  } catch (err) {
    logger.error(`Transcription job error: ${err.message}`);
    const entry = jobQueue.get(lectureId);
    if (entry) {
      entry.status = "failed";
      entry.transcriptError = err.message || "Unknown error";
      entry.transcriptionCompletedAt = new Date();
    }
    throw err;
  }
}

/* eslint-disable no-unused-vars */
const logger = {
  info: (...args) => console.log(`[transcriptionService] INFO: ${args.join(" ")}`),
  error: (...args) =>
    console.error(`[transcriptionService] ERROR: ${args.join(" ")}`),
  warn: (...args) => console.warn(`[transcriptionService] WARN: ${args.join(" ")}`),
};
/* eslint-enable no-unused-vars */

export { WHISPER_SERVICE_URL };