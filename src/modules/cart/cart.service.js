import { prisma } from '../../../lib/prisma.js';

export const addToCartService = async ({
  sessionId = '',
  customerId = 0,
  productId,
  quantity = 1,
  option = '[]',
  recurringId = 0,
}) => {
  const isLoggedIn = customerId > 0;

  const existing = await prisma.uvki_cart.findFirst({
    where: {
      customer_id: isLoggedIn ? customerId : 0,
      session_id: isLoggedIn ? '' : sessionId,
      product_id: productId,
      option: option,
      recurring_id: recurringId,
    },
  });

  if (existing) {
    return await prisma.uvki_cart.update({
      where: { cart_id: existing.cart_id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  return await prisma.uvki_cart.create({
    data: {
      api_id: 0,
      customer_id: isLoggedIn ? customerId : 0,
      session_id: isLoggedIn ? '' : sessionId,
      product_id: productId,
      recurring_id: recurringId,
      option: option,
      quantity: quantity,
      date_added: new Date(),
    },
  });
};

export const getCartService = async ({ sessionId = '', customerId = 0 }) => {
  const isLoggedIn = customerId > 0;

  return await prisma.uvki_cart.findMany({
    where: isLoggedIn
      ? { customer_id: customerId }
      : { session_id: sessionId, customer_id: 0 },
    orderBy: { date_added: 'desc' },
  });
};


export const updateCartQuantityService = async ({ cartId, quantity }) => {
  if (quantity <= 0) {
    return await prisma.uvki_cart.delete({
      where: { cart_id: cartId },
    });
  }

  return await prisma.uvki_cart.update({
    where: { cart_id: cartId },
    data: { quantity },
  });
};


export const removeFromCartService = async ({ cartId }) => {
  return await prisma.uvki_cart.delete({
    where: { cart_id: cartId },
  });
};

export const clearCartService = async ({ sessionId = '', customerId = 0 }) => {
  const isLoggedIn = customerId > 0;

  return await prisma.uvki_cart.deleteMany({
    where: isLoggedIn
      ? { customer_id: customerId }
      : { session_id: sessionId, customer_id: 0 },
  });
};

export const mergeGuestCartService = async ({ sessionId, customerId }) => {
  if (!sessionId || !customerId || customerId === 0) return;


  const guestItems = await prisma.uvki_cart.findMany({
    where: { session_id: sessionId, customer_id: 0 },
  });

  if (guestItems.length === 0) return;
  for (const item of guestItems) {
    const existing = await prisma.uvki_cart.findFirst({
      where: {
        customer_id: customerId,
        product_id: item.product_id,
        option: item.option,
        recurring_id: item.recurring_id,
      },
    });
    if (existing) {
      await prisma.uvki_cart.update({
        where: { cart_id: existing.cart_id },
        data: { quantity: existing.quantity + item.quantity },
      });
      await prisma.uvki_cart.delete({ where: { cart_id: item.cart_id } });
    } else {
      await prisma.uvki_cart.update({
        where: { cart_id: item.cart_id },
        data: { customer_id: customerId, session_id: '' },
      });
    }
  }
};