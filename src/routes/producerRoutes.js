import express from 'express';
import {
  getAllProducers,
  getProducerById,
  createProducer,
  updateProducer,
  deleteProducer
} from '../controllers/producerController.js';
import { authenticateToken, isProducer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllProducers);
router.get('/:id', getProducerById);
router.post('/', authenticateToken, isProducer, createProducer);
router.put('/:id', authenticateToken, isProducer, updateProducer);
router.delete('/:id', authenticateToken, isProducer, deleteProducer);

export default router;
