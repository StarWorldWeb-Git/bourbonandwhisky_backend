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



const cartRouter = Router();

cartRouter.get('/', optionalAuth, getCart);
cartRouter.post('/add', optionalAuth, addToCart);
cartRouter.put('/update', authMiddleware, updateCart);
cartRouter.delete('/remove/:cart_id', optionalAuth, removeFromCart);
cartRouter.delete('/clear', authMiddleware, clearCart);

export default cartRouter;