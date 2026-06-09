import { Router } from 'express';
import {
  listProducts,
  featuredProducts,
  flashDeals,
  getProduct,
} from '../controllers/product.controller';

export const productRouter = Router();

// Specific routes must be declared before the `:slug` catch-all.
productRouter.get('/', listProducts);
productRouter.get('/featured', featuredProducts);
productRouter.get('/flash-deals', flashDeals);
productRouter.get('/:slug', getProduct);
