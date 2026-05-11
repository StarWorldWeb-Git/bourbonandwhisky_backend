import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} from './cart.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { optionalAuth } from '../../middlewares/optionalauth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';



const cartRouter = Router();

cartRouter.get('/', optionalAuth, asyncHandler(getCart));
cartRouter.post('/add', optionalAuth, asyncHandler(addToCart));
cartRouter.put('/update', authMiddleware, asyncHandler(updateCart));
cartRouter.delete('/delete/:cart_id', optionalAuth, asyncHandler(removeFromCart));
cartRouter.delete('/clear', authMiddleware, asyncHandler(clearCart));

export default cartRouter;