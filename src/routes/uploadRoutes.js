import express from 'express';
import { upload, uploadImage, uploadImages, handleMulterError } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/upload - upload single image (protected)
router.post('/', authenticateToken, upload.single('image'), handleMulterError, uploadImage);

// POST /api/upload/multiple - upload multiple images (protected)
router.post('/multiple', authenticateToken, upload.array('images', 10), handleMulterError, uploadImages);

export default router;
