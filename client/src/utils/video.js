// Helpers to distinguish BrainWave-owned (Cloudinary) video URLs from
// legacy YouTube lecture URLs, so the student player can pick the right
// playback engine while keeping old courses working.

export const isYouTubeUrl = (url = "") => {
  if (!url) return false;
  return /youtube\.com|youtu\.be/i.test(url);
};

export const getYouTubeVideoId = (url) => {
  if (!url) return null;

  const regExp =
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})|youtu\.be\/([\w-]{11})|youtube\.com\/.*[?&]v=([\w-]{11})/;

  const match = url.match(regExp);

  if (!match) return null;

  return match[1] || match[2] || match[3] || null;
};

export const isCloudinaryUrl = (url = "") => {
  if (!url) return false;
  return url.includes("cloudinary.com");
};