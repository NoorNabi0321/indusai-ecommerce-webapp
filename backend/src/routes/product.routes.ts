import { Router } from 'express';
import {
  listProducts,
  featuredProducts,
  flashDeals,
  getProduct,
} from '../controllers/product.controller';
import { createReview, getReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema } from '../validation/review.validation';

export const productRouter = Router();

// Specific routes must be declared before the `:slug` catch-all.
productRouter.get('/', listProducts);
productRouter.get('/featured', featuredProducts);
productRouter.get('/flash-deals', flashDeals);

// Reviews (two-segment paths — never collide with `/:slug`).
productRouter.get('/:id/reviews', getReviews);
productRouter.post('/:id/reviews', authenticate, validate({ body: createReviewSchema }), createReview);

productRouter.get('/:slug', getProduct);
