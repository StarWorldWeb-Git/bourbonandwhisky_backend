import { prisma } from '../../../lib/prisma.js';
import { parsePositiveInt } from '../../utils/parsePostiveInt.js';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export const addToCartService = async ({
  sessionId = '',
  customerId = 0,
  productId,
  quantity = 1,
  option = '[]',
  recurringId = 0,
}) => {
  const existing = await prisma.uvki_cart.findFirst({
    where: {
      customer_id: customerId,
      session_id: sessionId,
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
      customer_id: customerId,
      session_id: sessionId,
      product_id: productId,
      recurring_id: recurringId,
      option: option,
      quantity: quantity,
      date_added: new Date(),
    },
  });
};

export const getCartService = async (query, { sessionId = '', customerId = 0 }) => {

  const page = parsePositiveInt(query.page, 1);
  const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;

  const where =
    customerId > 0
      ? { customer_id: customerId }
      : { customer_id: 0, session_id: sessionId };

  const [cartItems, total] = await Promise.all([
    await prisma.uvki_cart.findMany({
      where,
      orderBy: { date_added: 'desc' },
      skip,
      take: limit,
      include: {
        uvki_product: {
          select: {
            product_id: true,
            price: true,
            image: true,
            model: true,
            quantity: true,
            status: true,
            uvki_product_description: {
              where: { language_id: 1 },
              select: { name: true },
            },
            // Special price
            uvki_product_special: {
              select: {
                price: true,
                date_start: true,
                date_end: true,
                priority: true,
              },
              orderBy: { priority: 'asc' },
              take: 1,
            },
          },
        },
      },
    }),
    prisma.uvki_cart.count({ where })
  ])


  const cartItemsFormatted = cartItems.map((item) => ({
    cart_id: item.cart_id,
    customer_id: item.customer_id,
    session_id: item.session_id,
    product_id: item.product_id,
    quantity: item.quantity,
    option: item.option,
    recurring_id: item.recurring_id,
    date_added: item.date_added,
    product: item.uvki_product
      ? {
        product_id: item.uvki_product.product_id,
        name: item.uvki_product.uvki_product_description[0]?.name || '',
        price: item.uvki_product.price,
        special_price: item.uvki_product.uvki_product_special[0]?.price || null,
        image: item.uvki_product.image,
        model: item.uvki_product.model,
        stock: item.uvki_product.quantity,
        status: item.uvki_product.status,
      }
      : null,
  }));

  return {
    total,
    items: cartItemsFormatted,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
};


export const updateCartQuantityService = async ({ cartId, quantity }) => {
  if (quantity <= 0) {
    return await prisma.uvki_cart.delete({ where: { cart_id: cartId } });
  }

  return await prisma.uvki_cart.update({
    where: { cart_id: cartId },
    data: { quantity },
  });
};


export const removeFromCartService = async ({ cartId }) => {
  const deleted = await prisma.uvki_cart.delete({ where: { cart_id: cartId } });
  return deleted;
};


export const clearCartService = async ({ sessionId = '', customerId = 0 }) => {
  if (customerId > 0) {
    return await prisma.uvki_cart.deleteMany({
      where: { customer_id: customerId },
    });
  }

  return await prisma.uvki_cart.deleteMany({
    where: { customer_id: 0, session_id: sessionId },
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
        data: {
          customer_id: customerId,
          session_id: sessionId,
        },
      });
    }
  }
};