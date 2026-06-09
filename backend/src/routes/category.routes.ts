import { Router } from 'express';
import { listCategories } from '../controllers/category.controller';
import { productsByCategory } from '../controllers/product.controller';

export const categoryRouter = Router();

categoryRouter.get('/', listCategories);
categoryRouter.get('/:slug/products', productsByCategory);
