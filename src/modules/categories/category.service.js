
import { prisma } from "../../../lib/prisma.js";
import { parsePositiveInt } from "../../utils/parsePostiveInt.js";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export const listingCategoriesServices = async (query) => {

  const page = parsePositiveInt(query.page, 1);

  const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const offset = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.uvki_category_description.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        category_id: "asc",
      },
      select: {
        name: true,
        category_id: true,
        language_id: true,
      }
    }),
    prisma.uvki_category_description.count(),
  ]);


  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items: items,
  };;

}

export const showLimitCategoriesServices = async (query) => {

  const distinctCategories = await prisma.uvki_product_to_category.findMany({
    distinct: ["category_id"],
    select: { category_id: true },
    orderBy: { category_id: "asc" },
    take: 15,
  });

  const categoryIds = distinctCategories.map((c) => c.category_id);
  const result = await prisma.uvki_category.findMany({
    where: {
      category_id: { in: categoryIds },
      language_id: 1, parent_id: 0
    },
    orderBy: {
      category_id: "asc",
    },
    select: {
      uvki_category_description: {
        name: true,
        category_id: true,
        language_id: true,
      }
    },
  });

  return result;
};

export const showProductByCategoriesIdService = async (category_id) => {

  const category = await prisma.uvki_category.findUnique({
    where: { category_id: category_id },
    select: {
      image: true,
      uvki_category_description: {
        where: { language_id: 1 },
        select: { name: true },
      },
      uvki_product_to_category: {
        select: {
          uvki_product: {
            select: {
              product_id: true,
              price: true,
              image: true,
              uvki_product_description: {
                where: { language_id: 1 },
                select: { name: true },
              },
              uvki_product_special: {
                select: {
                  price: true,
                  date_start: true,
                  date_end: true
                }
              }
            },
          },
        },
      },
    },
  });

  if (!category) return null;
  const data = {
    image: category.image,
    name: category.uvki_category_description[0]?.name,
    products: category.uvki_product_to_category.map((p) => ({
      product_id: p.uvki_product.product_id,
      price: p.uvki_product.price,
      image: p.uvki_product.image,
      name: p.uvki_product.uvki_product_description[0]?.name,
      spcial_price: p.uvki_product.uvki_product_special[0]?.price,
      spcial_price_start_date: p.uvki_product.uvki_product_special[0]?.date_start,
      spcial_price_end_date: p.uvki_product.uvki_product_special[0]?.date_end
    })),
    total: category.uvki_product_to_category.length,
  };

  return data;
};

export const showTopCategoryService = async () => {
  const module = await prisma.uvki_journal3_module.findFirst({
    where: {
      module_type: "info_blocks",
      module_name: "Bourbon & Whisky Blocks"
    },
    select: { module_data: true }
  });

  const data = JSON.parse(module.module_data);

  const categories = data.items
    .filter((item) => item.status.status === "true")
    .map((item) => ({
      name: item.title.lang_1,
      image: item.image.lang_1,
      category_id: item.link.id,
    }));

  return categories;

}