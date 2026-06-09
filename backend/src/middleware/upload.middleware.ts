import multer from 'multer';
import { AppError } from '../utils/AppError';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/** In-memory multer storage — buffers are streamed to Cloudinary by the service. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed.', 422, 'INVALID_FILE_TYPE'));
    }
  },
});
