// ---------------------------------------------------------------------------
// rateLimiter.js
// Lightweight in-memory sliding-window rate limiter used only for the AI
// endpoint. Configuration is read from environment variables so limits can be
// tuned without code changes.
//
//   AI_RATE_LIMIT_WINDOW_MS     default 60000 (1 minute)
//   AI_RATE_LIMIT_MAX_REQUESTS  default 30 requests per window
// ---------------------------------------------------------------------------

const windowMs = parseInt(
  process.env.AI_RATE_LIMIT_WINDOW_MS || '60000',
  10
);
const maxRequests = parseInt(
  process.env.AI_RATE_LIMIT_MAX_REQUESTS || '30',
  10
);

// key -> [timestamps] (sliding window of hit times)
const buckets = new Map();
let requestsSinceCleanup = 0;

export const aiRateLimiter = (req, res, next) => {
  // clerkMiddleware runs globally, so req.auth is available here.
  const key = req.auth?.userId || req.ip || 'anonymous';
  const now = Date.now();

  let hits = buckets.get(key);
  if (!hits) {
    hits = [];
    buckets.set(key, hits);
  }

  // Drop hits outside the current window.
  while (hits.length && hits[0] <= now - windowMs) {
    hits.shift();
  }

  if (hits.length >= maxRequests) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - (now - hits[0])) / 1000)
    );
    res.set('Retry-After', String(retryAfterSec));
    return res.status(429).json({
      success: false,
      message:
        "You're asking BrainWave AI a lot right now. Please wait a moment and try again.",
    });
  }

  hits.push(now);

  // Occasional cleanup so the map does not grow without bound.
  requestsSinceCleanup += 1;
  if (requestsSinceCleanup >= 500) {
    requestsSinceCleanup = 0;
    for (const [bucketKey, bucket] of buckets) {
      if (
        !bucket.length ||
        bucket[bucket.length - 1] <= now - windowMs
      ) {
        buckets.delete(bucketKey);
      }
    }
  }

  return next();
};
