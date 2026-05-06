import {
  addToCartService,
  getCartService,
  updateCartQuantityService,
  removeFromCartService,
  clearCartService,
} from './cart.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import crypto from 'crypto';

const getCustomerId = (req) => req.customer?.customer_id || 0;


const resolveSessionId = (req, res) => {
  let sessionId = req.cookies?.guest_session || '';

  if (!sessionId) {
    sessionId = crypto.randomBytes(16).toString('hex');
    res.cookie('guest_session', sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  return sessionId;
};


export const getCart = async (req, res) => {

  const customerId = getCustomerId(req);
  const sessionId = req.cookies?.guest_session || '';

  const items = await getCartService(req.query,{ sessionId, customerId });
  return successResponse(res, 200, 'Cart fetched',  items || []);

};


export const addToCart = async (req, res) => {

  const { product_id, quantity = 1, option, recurring_id = 0 } = req.body;
  if (!product_id) return errorResponse(res, 400, 'product_id is required');

  const customerId = getCustomerId(req);
  const optionStr = typeof option === 'string' ? option : JSON.stringify(option || []);


  const sessionId = resolveSessionId(req, res);

  const item = await addToCartService({
    sessionId,
    customerId,
    productId: Number(product_id),
    quantity: Number(quantity),
    option: optionStr,
    recurringId: Number(recurring_id),
  });

  return successResponse(res, 200, 'Added to cart', item);

};


export const updateCart = async (req, res) => {

  const { cart_id, quantity } = req.body;
  if (!cart_id) return errorResponse(res, 400, 'cart_id is required');

  const result = await updateCartQuantityService({
    cartId: Number(cart_id),
    quantity: Number(quantity),
  });
  return successResponse(res, 200, 'Cart updated', result);

};


export const removeFromCart = async (req, res) => {

  const { cart_id } = req.params;
  if (!cart_id) return errorResponse(res, 400, 'cart_id is required');

  const deletedItem = await removeFromCartService({ cartId: Number(cart_id) });
  return successResponse(res, 200, 'Item removed from cart', deletedItem);

};


export const clearCart = async (req, res) => {

  const customerId = getCustomerId(req);
  const sessionId = req.cookies?.guest_session || '';

  await clearCartService({ sessionId, customerId });
  return successResponse(res, 200, 'Cart cleared');

};