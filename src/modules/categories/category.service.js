
import { skip } from "@prisma/client/runtime/client";
import { prisma } from "../../../lib/prisma.js";
import { parsePositiveInt } from "../../utils/parsePostiveInt.js";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export const listingCategoriesServices = async (query) => {
  const page = parsePositiveInt(query.page, 1);
  const parentId = parseInt(query.parent_id);

  const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const offset = (page - 1) * limit;

  const whereCondition = {
    ...(parentId && { parent_id: parentId }),
  };
  const [item, total] = await prisma.$transaction([
    prisma.uvki_category.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        category_id: "desc",
      },
      where: whereCondition,
      select: {
        parent_id: true,
        uvki_category_description: {
          select: {
            name: true,
            category_id: true,
            language_id: true,
          },
        },
      },
    }),

    prisma.uvki_category.count({
      where: whereCondition,
    }),
  ]);

  const items = item?.map((c) => ({
    parent_id: c?.parent_id,
    name: c?.uvki_category_description?.[0]?.name,
    category_id: c?.uvki_category_description?.[0]?.category_id,
    language_id: c?.uvki_category_description?.[0]?.language_id,
  }));

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items,
  };
};

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
export const showProductByCategoriesIdService = async (category_id, query = {}) => {
  const DEFAULT_LIMIT = 10;
  const MAX_LIMIT = 100;

  const parsePositiveInt = (value, defaultValue) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
  };

  const page = parsePositiveInt(query.page, 1);

  const requestedLimit = parsePositiveInt(
    query.limit,
    DEFAULT_LIMIT
  );

  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const offset = (page - 1) * limit;

  const category = await prisma.uvki_category.findUnique({
    where: {
      category_id: category_id,
    },
    select: {
      image: true,

      uvki_category_description: {
        where: { language_id: 1 },
        select: {
          name: true,
        },
      },

      uvki_product_to_category: {
        skip: offset,
        take: limit,

        select: {
          uvki_product: {
            select: {
              product_id: true,
              price: true,
              image: true,

              uvki_product_description: {
                where: { language_id: 1 },
                select: {
                  name: true,
                },
              },

              uvki_product_special: {
                select: {
                  price: true,
                  date_start: true,
                  date_end: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!category) return null;

  const products = category.uvki_product_to_category.map((p) => ({
    product_id: p.uvki_product.product_id,
    price: p.uvki_product.price,
    image: p.uvki_product.image,
    name: p.uvki_product.uvki_product_description[0]?.name || null,

    special_price:
      p.uvki_product.uvki_product_special[0]?.price || null,

    special_price_start_date:
      p.uvki_product.uvki_product_special[0]?.date_start || null,

    special_price_end_date:
      p.uvki_product.uvki_product_special[0]?.date_end || null,
  }));

  return {
    data: products,
    total: products.length,
    page,
    limit,
  };
};

export const getHomepageDataService = async () => {

  const [categoriesModule, titleModule] = await Promise.all([
    prisma.uvki_journal3_module.findFirst({
      where: {
        module_type: "info_blocks",
        module_name: "Bourbon & Whisky Blocks"
      },
      select: { module_data: true }
    }),

    prisma.uvki_journal3_module.findUnique({
      where: { module_id: 147 },
      select: { module_data: true }
    })
  ]);

  const categoriesData = JSON.parse(categoriesModule.module_data);
  const titleData = JSON.parse(titleModule.module_data);

  const activeCategories = categoriesData.items.filter(
    (item) => item.status.status === "true"
  );

  const categoryIds = activeCategories.map(
    (item) => Number(item.link.id)
  );

  const categories = await prisma.uvki_category.findMany({
    where: {
      category_id: {
        in: categoryIds,
      },
    },
    select: {
      category_id: true,
      parent_id: true,
    },
  });
  return {
    title: titleData.general.title.lang_1,
    description: titleData.general.subtitle.lang_1,

    categories: activeCategories.map((item) => {
      const category = categories.find(
        (c) => c.category_id === Number(item.link.id)
      );

      return {
        name: item.title.lang_1,
        image: item.image.lang_1,
        category_id: item.link.id,
        parent_id: category?.parent_id || 0,
      };
    }),
  };
};