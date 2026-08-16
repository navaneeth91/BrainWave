/** Extract a friendly message from a Clerk SDK error. */
export function getClerkErrorMessage(err, fallback = 'Something went wrong') {
  if (err?.errors?.length) {
    const e = err.errors[0];
    return e.longMessage || e.message || fallback;
  }
  if (typeof err === 'string' && err) return err;
  return (err && err.message) || fallback;
}

/** Validate an email address with a lightweight check. */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}