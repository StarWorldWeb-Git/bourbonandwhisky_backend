import {
  addToCartService,
  getCartService,
  updateCartQuantityService,
  removeFromCartService,
  clearCartService,
} from './cart.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { generateSessionId } from '../../utils/generateSessionId.js';


const getCustomerId = (req) => req.customer?.customer_id || 0;
const getSessionId  = (req) => req.cookies?.guest_session || '';


export const getCart = async (req, res) => {
  try {
    const items = await getCartService({
      sessionId:  getSessionId(req),
      customerId: getCustomerId(req),
    });
    return successResponse(res, 200, 'Cart fetched', { total: items.length, items });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1, option, recurring_id = 0 } = req.body;

    if (!product_id) return errorResponse(res, 400, 'product_id is required');

    const customerId = getCustomerId(req);
    const sessionId  = customerId > 0 ? '' : getSessionId(req);
    const optionStr  = typeof option === 'string' ? option : JSON.stringify(option || []);

    
    if (customerId === 0 && !req.cookies?.guest_session) {
      
      const newSession = generateSessionId();
      res.cookie('guest_session', newSession, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
      });
    
      req.cookies = { ...req.cookies, guest_session: newSession };
    }

    const item = await addToCartService({
      sessionId:   customerId > 0 ? '' : (req.cookies?.guest_session || ''),
      customerId,
      productId:   Number(product_id),
      quantity:    Number(quantity),
      option:      optionStr,
      recurringId: Number(recurring_id),
    });

    return successResponse(res, 200, 'Added to cart', item);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateCart = async (req, res) => {
  try {
    const { cart_id, quantity } = req.body;
    if (!cart_id) return errorResponse(res, 400, 'cart_id is required');

    const result = await updateCartQuantityService({
      cartId:   Number(cart_id),
      quantity: Number(quantity),
    });
    return successResponse(res, 200, 'Cart updated', result);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { cart_id } = req.params;
    if (!cart_id) return errorResponse(res, 400, 'cart_id is required');

    await removeFromCartService({ cartId: Number(cart_id) });
    return successResponse(res, 200, 'Item removed from cart');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};


export const clearCart = async (req, res) => {
  try {
    await clearCartService({
      sessionId:  getSessionId(req),
      customerId: getCustomerId(req),
    });
    return successResponse(res, 200, 'Cart cleared');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};