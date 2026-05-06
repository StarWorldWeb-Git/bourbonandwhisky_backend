import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from './wishlish.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { optionalAuth } from '../../middlewares/optionalauth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';


const wishlistRouter = Router();

wishlistRouter.get('/', optionalAuth, asyncHandler(getWishlist));
wishlistRouter.post('/add', optionalAuth, asyncHandler(addToWishlist));
wishlistRouter.delete('/delete/:product_id', authMiddleware, asyncHandler(removeFromWishlist));
wishlistRouter.get('/check/:product_id', authMiddleware, asyncHandler(checkWishlist));

export default wishlistRouter;