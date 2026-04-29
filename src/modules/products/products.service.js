import { prisma } from "../../../lib/prisma.js";
import { parsePositiveInt } from "../../utils/parsePostiveInt.js";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const decodeHtml = (input = "") => {
  if (!input) return "";

  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}



export const listProducts = async (query) => {
  const page = parsePositiveInt(query.page, 1);
  const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;
  const searchText = (query.q ?? "").toString().trim();
  const languageId = parsePositiveInt(query.language_id, 1);
  const categoryId = parsePositiveInt(query.category_id, 0);
  const manufacturerId = parsePositiveInt(query.manufacturer_id, 0);
  const minPrice = (query.min_price !== undefined && query.min_price !== "") ? parseFloat(query.min_price) : NaN;
  const maxPrice = (query.max_price !== undefined && query.max_price !== "") ? parseFloat(query.max_price) : NaN;
  const exactPrice = (query.price !== undefined && query.price !== "") ? parseFloat(query.price) : NaN;
  const sort = (query.sort ?? "").toString().trim();
  const availability = (query.availability ?? "").toString().trim();

  const pricefilter = {};
  if (!isNaN(exactPrice)) {
    pricefilter.equals = exactPrice;
  } else {
    if (!isNaN(minPrice)) pricefilter.gte = minPrice;
    if (!isNaN(maxPrice)) pricefilter.lte = maxPrice;
  }
  const hasPriceFilter = Object.keys(pricefilter).length > 0;


  let orderBy = { product_id: "desc" };
  if (sort === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { price: "desc" };
  } else if (sort === "name_asc") {
    orderBy = { model: "asc" };
  } else if (sort === "name_desc") {
    orderBy = { model: "desc" };
  }

  const where = {
    AND: [
      searchText ? {
        OR: [
          { model: { contains: searchText } },
          { sku: { contains: searchText } },
          { upc: { contains: searchText } },
          { uvki_product_description: { some: { name: { contains: searchText }, language_id: languageId } } }
        ],
      } : {},
      categoryId > 0 ? {
        uvki_product_to_category: {
          some: {
            category_id: categoryId
          }
        }
      } : {},
      manufacturerId > 0 ? {
        manufacturer_id: manufacturerId
      } : {},
      hasPriceFilter ? { price: pricefilter } : {},
      availability === "in_stock" ? { quantity: { gt: 0 } } : availability === "out_of_stock" ? { quantity: 0 } : {},

    ]
  };

  const [items, total] = await Promise.all([
    prisma.uvki_product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        product_id: true,
        model: true,
        sku: true,
        price: true,
        status: true,
        image: true,
        quantity: true,
        date_added: true,
        uvki_product_description: {
          where: { language_id: languageId },
          select: {
            name: true,
          },

        },
        uvki_product_special: {
          where: {
            customer_group_id: 1,
          },
          orderBy: { priority: "asc" },
          select: {
            price: true,
            date_start: true,
            date_end: true,
          }
        }
      },
    }),
    prisma.uvki_product.count({ where }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isValidSpecial = (special) => {
    const start = new Date(special.date_start);
    const end = new Date(special.date_end);


    const startOk = isNaN(start.getTime()) || start <= today;
    const endOk = isNaN(end.getTime()) || end >= today;

    return startOk && endOk;
  };

  const flatItems = items.map(({ uvki_product_description, uvki_product_special, ...product }) => {
    const validSpecial = uvki_product_special.find(isValidSpecial);

    return {
      ...product,
      name: uvki_product_description[0]?.name ?? null,
      original_price: product.price,
      special_price: validSpecial?.price ?? null,
    };
  });

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items: flatItems,
  };

}

export const parseProductId = (idParam) => {
  return parsePositiveInt(idParam, 0);
};

export const getProductById = async (productId, languageId = 1) => {
  const product = await prisma.uvki_product.findUnique({
    where: { product_id: productId },
    select: {
      price: true,
      model: true,
      sku: true,
      upc: true,
      status: true,
      image: true,
      quantity: true,
      uvki_product_description: {
        where: { language_id: languageId },
        take: 1,
      },
      uvki_product_image: {
        select: { image: true },
        orderBy: { sort_order: "asc" },
      },
      uvki_manufacturer: {
        select: { image: true },
      },
    },
  });

  if (!product) return null;

  const desc = product.uvki_product_description[0];

  return {
    price: product.price,
    model: product.model,
    sku: product.sku,
    upc: product.upc,
    status: product.status,
    image: product.image,
    images: product.uvki_product_image.map((img) => img.image),
    quantity: product.quantity,
    name: desc?.name ?? null,
    description: desc ? decodeHtml(desc.description) : null,
    meta_title: desc?.meta_title ?? null,
    meta_description: desc?.meta_description ?? null,
    meta_keyword: desc?.meta_keyword ?? null,
    tag: desc?.tag ?? null,
    brandImg: product.uvki_manufacturer?.image ?? null,
  };
};

export const mostviewdproductservice = async () => {

  const result = await prisma.uvki_product.findMany({
    where: { status: true },
    orderBy: { viewed: "desc" },
    take: 4,
    select: {
      product_id: true,
      model: true,
      sku: true,
      price: true,
      status: true,
      image: true,
      quantity: true,
      viewed: true,
      uvki_product_description: {
        where: { language_id: 1 },
        select: {
          name: true,
        },
      },
    },
  });

  const flatItems = result.map(({ uvki_product_description, ...product }) => ({
    ...product,
    name: uvki_product_description[0]?.name ?? null,
  }));

  console.log("result", flatItems);
  return flatItems;
}

export const countProductViewedService = async (params) => {

  const productsID = params.id;
  const result = await prisma.uvki_product.updateMany({
    where: { product_id: parseProductId(productsID) },
    data: { viewed: { increment: 1 } },
  });

  return result;
}