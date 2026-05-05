import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from './wishlish.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { optionalAuth } from '../../middlewares/optionalauth.js';



const wishlistRouter = Router();

wishlistRouter.get('/', optionalAuth, getWishlist);
wishlistRouter.post('/add', optionalAuth, addToWishlist);
wishlistRouter.delete('/remove/:product_id', authMiddleware, removeFromWishlist);
wishlistRouter.get('/check/:product_id', authMiddleware, checkWishlist);

export default wishlistRouter;