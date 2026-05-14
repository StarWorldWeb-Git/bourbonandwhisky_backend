
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

  const items = await Promise.all(item?.map(async (c) => {
    const seoUrl = await prisma.uvki_seo_url.findFirst({
      where: {
        query: `category_id=${c.uvki_category_description?.[0]?.category_id}`,
        store_id: 0,
        language_id: 1,
      },
      select: { keyword: true }
    });

    return {
      parent_id: c?.parent_id,
      name: c?.uvki_category_description?.[0]?.name,
      category_id: c?.uvki_category_description?.[0]?.category_id,
      language_id: c?.uvki_category_description?.[0]?.language_id,
      slug: seoUrl?.keyword || null,
    };
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
  const items = await prisma.uvki_category.findMany({
    where: {
      category_id: { in: categoryIds },
      parent_id: 0
    },
    orderBy: {
      category_id: "asc",
    },
    select: {
      uvki_category_description: {
        where: { language_id: 1 },
        select: {
          name: true,
          category_id: true,
          language_id: true,
        }
      }
    },
  });

  const result = await Promise.all(items.map(async (c) => {
    const seoUrl = await prisma.uvki_seo_url.findFirst({
      where: {
        query: `category_id=${c.uvki_category_description?.[0]?.category_id}`,
        store_id: 0,
        language_id: 1,
      },
      select: { keyword: true }
    });
    return {
      category_id: c.uvki_category_description?.[0]?.category_id,
      name: c.uvki_category_description?.[0]?.name,
      language_id: c.uvki_category_description?.[0]?.language_id,
      slug: seoUrl?.keyword || null
    };
  }));

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

  const products = await Promise.all(category.uvki_product_to_category.map(async (p) => {
    const seoUrl = await prisma.uvki_seo_url.findFirst({
      where: {
        query: `product_id=${p.uvki_product.product_id}`,
        store_id: 0,
        language_id: 1,
      },
      select: { keyword: true }
    });

    return {
      product_id: p.uvki_product.product_id,
      price: p.uvki_product.price,
      image: p.uvki_product.image,
      name: p.uvki_product.uvki_product_description[0]?.name || null,
      slug: seoUrl?.keyword || null,

      special_price:
        p.uvki_product.uvki_product_special[0]?.price || null,

      special_price_start_date:
        p.uvki_product.uvki_product_special[0]?.date_start || null,

      special_price_end_date:
        p.uvki_product.uvki_product_special[0]?.date_end || null,
    };
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

    categories: await Promise.all(activeCategories.map(async (item) => {
      const category = categories.find(
        (c) => c.category_id === Number(item.link.id)
      );

      const seoUrl = await prisma.uvki_seo_url.findFirst({
        where: {
          query: `category_id=${item.link.id}`,
          store_id: 0,
          language_id: 1,
        },
        select: { keyword: true }
      });

      return {
        name: item.title.lang_1,
        image: item.image.lang_1,
        category_id: item.link.id,
        parent_id: category?.parent_id || 0,
        slug: seoUrl?.keyword || null,
      };
    })),
  };
};

export const showGiftBasketsSerivce = async () => {
  const giftsbasketData = await prisma.uvki_category.findMany({
    where: {
      parent_id: 253
    },
    orderBy: { category_id: "desc" },
    select: {
      parent_id: true,
      image: true,
      category_id: true,
      uvki_category_description: {
        select: {
          name: true
        }
      }
    }
  })

  const formateData = await Promise.all(giftsbasketData.map(async (g) => {
    const seoUrl = await prisma.uvki_seo_url.findFirst({
      where: {
        query: `category_id=${g.category_id}`,
        store_id: 0,
        language_id: 1,
      },
      select: { keyword: true }
    });

    return {
      name: g?.uvki_category_description?.[0]?.name,
      image: g?.image,
      category_id: g?.category_id,
      parent_id: g?.parent_id,
      slug: seoUrl?.keyword || null,
    };
  }));

  return formateData;
}

export const showGiftByBrandService = async () => {
  const PARENT_IDS = [59, 166, 205, 257, 303];
  const CATEGORY_KEYS = ['burboncategory', 'scotchcategory', 'liquors_callection_categroy', 'occasions', 'Personalizes gifts'];

  const [results, parents, productCategoriesRaw] = await Promise.all([
    prisma.uvki_category.findMany({
      where: { parent_id: { in: PARENT_IDS } },
      select: {
        parent_id: true,
        uvki_category_description: {
          select: { name: true, category_id: true }
        }
      }
    }),

    prisma.uvki_category.findMany({
      where: { category_id: { in: PARENT_IDS } },
      select: {
        category_id: true,
        uvki_category_description: {
          select: { name: true, category_id: true }
        }
      }
    }),

    prisma.$queryRaw`SELECT DISTINCT category_id FROM uvki_product_to_category`
  ]);

  const validCategoryIds = new Set(productCategoriesRaw.map(pc => pc.category_id));


  const parentNames = parents.reduce((acc, p) => {
    acc[p.category_id] = p.uvki_category_description?.[0]?.name ?? null;
    return acc;
  }, {});

  const grouped = PARENT_IDS.reduce((acc, id) => {
    acc[id] = results.filter(r => r.parent_id === id);
    return acc;
  }, {});

  const formattedData = await PARENT_IDS.reduce(async (accPromise, id, index) => {
    const acc = await accPromise;
    const key = CATEGORY_KEYS[index];

    const children = await Promise.all(grouped[id].flatMap(d =>
      d.uvki_category_description
        .filter(desc => validCategoryIds.has(desc.category_id))
        .map(async (desc) => {
          const seoUrl = await prisma.uvki_seo_url.findFirst({
            where: {
              query: `category_id=${desc.category_id}`,
              store_id: 0,
              language_id: 1,
            },
            select: { keyword: true }
          });
          return {
            parent_id: d.parent_id,
            name: desc.name,
            category_id: desc.category_id,
            slug: seoUrl?.keyword || null
          };
        })
    ));

    acc[key] = {
      parent_id: id,
      parent_name: parentNames[id],
      children
    };

    return acc;
  }, Promise.resolve({}));

  return formattedData;
};


export const getBestSellingGiftSetService = async () => {

  const orderCounts = await prisma.uvki_order_product.groupBy({
    by: ['product_id'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 20
  });

  const productIds = orderCounts.map(o => o.product_id);

  const products = await prisma.uvki_product.findMany({
    where: {
      product_id: { in: productIds },
      status: true,
    },
    select: {
      product_id: true,
      price: true,
      image: true,
      viewed: true,
      uvki_product_description: {
        where: { language_id: 1 },
        select: { name: true }
      },
      uvki_product_special: {
        select: {
          price: true,
          date_start: true,
          date_end: true
        },
        orderBy: { priority: 'asc' },
        take: 1
      }
    }
  });



  const countMap = orderCounts.reduce((acc, o) => {
    acc[o.product_id] = o._sum.quantity ?? 0;
    return acc;
  }, {});


  const seoUrls = await prisma.uvki_seo_url.findMany({
    where: {
      query: { in: productIds.map(id => `product_id=${id}`) },
      store_id: 0,
      language_id: 1,
    },
    select: { query: true, keyword: true }
  });

  const slugMap = {};
  seoUrls.forEach(s => {
    const id = s.query.split('product_id=')[1];
    slugMap[id] = s.keyword;
  });

  const formattedData = products
    .map(p => ({
      product_id: p.product_id,
      name: p.uvki_product_description?.[0]?.name ?? null,
      price: p.price,
      special_price: p.uvki_product_special?.[0]?.price ?? null,
      image: p.image,
      viewed: p.viewed,
      total_ordered: countMap[p.product_id] ?? 0,
      slug: slugMap[p.product_id] ?? null
    }))
    .sort((a, b) => a.total_ordered - b.total_ordered)
    .slice(0, 10);

  return formattedData;
};