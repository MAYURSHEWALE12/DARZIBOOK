import multer from 'multer';
import { upload as uploadConfig } from '../config/cloudinary.js';

export const uploadSingle = uploadConfig.single('photo');
export const uploadArray = uploadConfig.array('photos', 10);
export const uploadLogo = uploadConfig.single('logo');

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max 5MB allowed.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message });
  next();
};
