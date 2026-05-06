import { query } from 'express-validator';
import { prisma } from '../../../lib/prisma.js';
import { parsePositiveInt } from '../../utils/parsePostiveInt.js';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export const addToWishlistService = async ({ customerId, productId }) => {

  const existing = await prisma.uvki_customer_wishlist.findUnique({
    where: {
      customer_id_product_id: {
        customer_id: customerId,
        product_id: productId,
      },
    },
  });

  if (existing) {
    return { already_exists: true, data: existing };
  }

  const item = await prisma.uvki_customer_wishlist.create({
    data: {
      customer_id: customerId,
      product_id: productId,
      date_added: new Date(),
    },
  });

  return { already_exists: false, data: item };
};


export const getWishlistService = async (query,{ customerId, LANGUAGE_ID = 1 }) => {

  const page = parsePositiveInt(query.page, 1);
  const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    await prisma.uvki_customer_wishlist.findMany({
      where: { customer_id: customerId },
      orderBy: { date_added: 'desc' },
      include: {
        uvki_product: {
          select: {
            product_id: true,
            price: true,
            image: true,
            status: true,
            quantity: true,
            uvki_product_description: {
              where: { language_id: LANGUAGE_ID },
              select: { name: true },
            }
          }
        }
      }
    }),
    prisma.uvki_customer_wishlist.count({
      where: { customer_id: customerId },
    }),
  ])

  const formattedItems = items.map(item => ({
    product_id: item.product_id,
    date_added: item.date_added,
    name: item.uvki_product?.uvki_product_description?.[0]?.name ?? null,
    price: item.uvki_product?.price ?? null,
    image: item.uvki_product?.image ?? null,
    status: item.uvki_product?.status ?? null,
    in_stock: (item.uvki_product?.quantity ?? 0) > 0,
  }));


  return {
    total,
    page,
    limit,
    items: formattedItems,
    totalPages: Math.ceil(total / limit),
  };
} 
 


export const removeFromWishlistService = async ({ customerId, productId }) => {

  const deleted = await prisma.uvki_customer_wishlist.delete({
    where: {
      customer_id_product_id: {
        customer_id: customerId,
        product_id: productId,
      },
    },
  });
  return deleted;
};


export const isInWishlistService = async ({ customerId, productId }) => {
  if (!customerId || customerId === 0) return false;

  const item = await prisma.uvki_customer_wishlist.findUnique({
    where: {
      customer_id_product_id: {
        customer_id: customerId,
        product_id: productId,
      },
    },
  });

  return !!item;
};


export const clearWishlistService = async ({ customerId }) => {
  return await prisma.uvki_customer_wishlist.deleteMany({
    where: { customer_id: customerId },
  });
};

export const mergeGuestWishlistService = async ({ customerId, guestProductIds = [] }) => {
  if (!customerId || guestProductIds.length === 0) return;

  for (const productId of guestProductIds) {
    await prisma.uvki_customer_wishlist.upsert({
      where: {
        customer_id_product_id: {
          customer_id: customerId,
          product_id: productId,
        },
      },
      update: {},
      create: {
        customer_id: customerId,
        product_id: productId,
        date_added: new Date(),
      },
    });
  }
};