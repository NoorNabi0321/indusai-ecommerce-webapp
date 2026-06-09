import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { deleteReview } from '../controllers/review.controller';

export const reviewRouter = Router();

reviewRouter.delete('/:id', authenticate, deleteReview);
