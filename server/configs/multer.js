import multer from "multer";

// Existing image/thumbnail uploads use disk storage.
const storage = multer.diskStorage({});

const upload = multer({ storage });

// Video uploads use memory storage so course videos are never
// permanently stored on the local Node.js server. The buffer is
// uploaded straight to Cloudinary.
const videoStorage = multer.memoryStorage();

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: MAX_VIDEO_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'video/mpeg',
      'video/3gpp',
    ];

    if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
      const error = new Error('Invalid video type. Please upload a video file (MP4, WebM, OGG, MOV, AVI, MKV, MPEG, 3GP).');
      error.status = 400;
      return cb(error);
    }

    cb(null, true);
  },
});

export default upload;
export { videoUpload, MAX_VIDEO_SIZE };