import { prisma } from "../../../lib/prisma.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export async function listProducts(query) {
  const page = parsePositiveInt(query.page, 1);
  const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;
  const searchText = (query.q ?? "").toString().trim();
  const languageId = parsePositiveInt(query.language_id, 1);

  const where = searchText
    ? {
        OR: [
          { model: { contains: searchText } },
          { sku: { contains: searchText } },
          { upc: { contains: searchText } },
        ],
      }
    : {};
const [items, total] = await Promise.all([
    prisma.uvki_product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { product_id: "desc" },
      select: {
        product_id: true,
        model: true,
        sku: true,
        price: true,
        status: true,
        image: true,
        quantity: true,
        uvki_product_description: {
          where: { language_id: languageId },
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.uvki_product.count({ where }),
  ]);


const flatItems = items.map(({ uvki_product_description, ...product }) => ({
  ...product,
  name: uvki_product_description[0]?.name ?? null,
}));

return {
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  items: flatItems, // 👈 flatItems bhejo
};
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items,
  };
}

export function parseProductId(idParam) {
  return parsePositiveInt(idParam, 0);
}

export async function getProductById(productId, languageId = 1) {
  return prisma.uvki_product.findUnique({
    where: { product_id: productId },
    include: {
      uvki_product_description: {
        where: { language_id: languageId },
      },
    },
  });
}
