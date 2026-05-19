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

  let categoryId = parsePositiveInt(query.category_id, 0);
  let manufacturerId = parsePositiveInt(query.manufacturer_id, 0);
  let productId = parsePositiveInt(query.product_id, 0);

  if (query.category_id && categoryId === 0) {
    const seoUrl = await prisma.uvki_seo_url.findFirst({
      where: {
        keyword: query.category_id,
        store_id: 0,
        language_id: languageId,
      }
    });
    if (seoUrl?.query?.startsWith('category_id=')) {
      categoryId = parseInt(seoUrl.query.split('category_id=')[1]);
    }
  }


  if (query.manufacturer_id && manufacturerId === 0) {
    const seoUrl = await prisma.uvki_seo_url.findFirst({
      where: {
        keyword: query.manufacturer_id,
        store_id: 0,
        language_id: languageId,
      }
    });
    if (seoUrl?.query?.startsWith('manufacturer_id=')) {
      manufacturerId = parseInt(seoUrl.query.split('manufacturer_id=')[1]);
    }
  }

  if (query.product_id && productId === 0) {
    const seoUrl = await prisma.uvki_seo_url.findFirst({
      where: {
        keyword: query.product_id,
        store_id: 0,
        language_id: languageId,
      }
    });
    if (seoUrl?.query?.startsWith('product_id=')) {
      productId = parseInt(seoUrl.query.split('product_id=')[1]);
    }
  }

  if (query.slug) {
    const seoUrl = await prisma.uvki_seo_url.findFirst({
      where: {
        keyword: query.slug,
        store_id: 0,
        language_id: languageId,
      }
    });
    if (seoUrl) {
      if (seoUrl.query.startsWith('category_id=')) {
        categoryId = parseInt(seoUrl.query.split('category_id=')[1]);
      } else if (seoUrl.query.startsWith('manufacturer_id=')) {
        manufacturerId = parseInt(seoUrl.query.split('manufacturer_id=')[1]);
      } else if (seoUrl.query.startsWith('product_id=')) {
        productId = parseInt(seoUrl.query.split('product_id=')[1]);
      }
    }
  }

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


  let orderBy = [
    { quantity: "desc" }, 
    { product_id: "desc" }
  ];;
  if (sort === "price_asc") {
    orderBy = [{ price: "asc" },{ quantity: "desc" }, { product_id: "desc" }];
  } else if (sort === "price_desc") {
    orderBy = [{ price: "desc" },{ quantity: "desc" }, { product_id: "desc" }];
  } else if (sort === "name_asc") {
    orderBy = [{ model: "asc" },{ quantity: "desc" }, { product_id: "desc" }];
  } else if (sort === "name_desc") {
    orderBy = [{ model: "desc" },{ quantity: "desc" }, { product_id: "desc" }];
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
      productId > 0 ? {
        product_id: productId
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

  const productIds = items.map(p => `product_id=${p.product_id}`);
  const seoUrls = await prisma.uvki_seo_url.findMany({
    where: {
      query: { in: productIds },
      store_id: 0,
      language_id: languageId,
    },
    select: {
      query: true,
      keyword: true,
    }
  });
  const slugMap = {};
  seoUrls.forEach(s => {
    const id = s.query.split('product_id=')[1];
    slugMap[id] = s.keyword;
  });


  const flatItems = items.map(({ uvki_product_description, uvki_product_special, ...product }) => {
    const validSpecial = uvki_product_special.find(isValidSpecial);
    return {
      ...product,
      name: uvki_product_description[0]?.name ?? null,
      original_price: product.price,
      special_price: validSpecial?.price ?? null,
      slug: slugMap[product.product_id] ?? null,
    };
  });

  let categoryDetails = null;
  if (categoryId > 0) {
    const categoryDesc = await prisma.uvki_category_description.findFirst({
      where: { category_id: categoryId, language_id: languageId },
      select: { name: true, description: true }
    });
    if (categoryDesc) {
      categoryDetails = {
        name: categoryDesc.name,
        description: decodeHtml(categoryDesc.description)
      };
    }
  }

  let manufacturerDetails = null;

  if (manufacturerId > 0) {
    const manufacturer = await prisma.uvki_manufacturer.findFirst({
      where: { manufacturer_id: manufacturerId },
      select: {
        name: true,
        uvki_manufacturer_description: {
          select: {
            description: true,
          },
        },
      },
    });

    if (manufacturer) {
      const descriptions = manufacturer.uvki_manufacturer_description?.map((m) => m?.description) ?? [];
      manufacturerDetails = {
        name: manufacturer.name,
        description: decodeHtml(descriptions[0] ?? ""),
      };
    }
  }

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items: flatItems,
    resolvedIds: {
      categoryId,
      manufacturerId,
      productId
    },
    categoryDetails,
    manufacturerDetails
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
      product_id: true,
      uvki_product_description: {
        where: { language_id: languageId },
        take: 1,
      },
      uvki_product_image: {
        select: { image: true },
        orderBy: { sort_order: "asc" },
      },
      uvki_product_option: {
        select: {
          product_option_id: true,
          option_id: true,
          value: true,
          required: true,
          uvki_option: {
            select: {
              type: true,
              uvki_option_description: {
                where: { language_id: languageId },
                select: { name: true }
              }
            }
          }
        }
      },
      uvki_manufacturer: {
        select: { image: true, manufacturer_id: true },
      },
      uvki_product_special: {
        where: { customer_group_id: 1 },
        orderBy: { priority: "asc" },
        select: {
          price: true,
          date_start: true,
          date_end: true,
        }
      },
      uvki_review: {
        select: {
          author: true,
          text: true,
          rating: true,
          date_added: true
        }
      }
    },
  });

  if (!product) return null;

  const seoUrl = await prisma.uvki_seo_url.findFirst({
    where: {
      query: `product_id=${productId}`,
      store_id: 0,
      language_id: languageId,
    },
    select: { keyword: true }
  });
  const ManufactureSeoUrl = await prisma.uvki_seo_url.findFirst({
    where: {
      query: `manufacturer_id=${product.uvki_manufacturer?.manufacturer_id ?? null}`,
      store_id: 0,
      language_id: languageId,
    },
    select: { keyword: true }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isValidSpecial = (special) => {
    const start = new Date(special.date_start);
    const end = new Date(special.date_end);
    const startOk = isNaN(start.getTime()) || start <= today;
    const endOk = isNaN(end.getTime()) || end >= today;
    return startOk && endOk;
  };

  const validSpecial = product.uvki_product_special.find(isValidSpecial);

  const desc = product.uvki_product_description[0];

  return {
    original_price: product.price,
    special_price: validSpecial?.price ?? null,
    model: product.model,
    sku: product.sku,
    upc: product.upc,
    status: product.status,
    product_id: product.product_id,
    image: product.image,
    images: product.uvki_product_image.map((img) => img.image),
    quantity: product.quantity,
    name: desc?.name ?? null,
    description: desc ? decodeHtml(desc.description) : null,
    meta_title: desc?.meta_title ?? null,
    meta_description: desc?.meta_description ?? null,
    meta_keyword: desc?.meta_keyword ?? null,
    tag: desc?.tag ?? null,
    uvki_product_option: product.uvki_product_option,
    brandImg: product.uvki_manufacturer?.image ?? null,
    manufacturer_id: product.uvki_manufacturer?.manufacturer_id ?? null,
    product_review: product?.uvki_review.map((p) => ({
      author: p?.author,
      text: p?.text,
      rating: p?.rating,
      date_added: p?.date_added
    })),
    slug: seoUrl?.keyword ?? null,
    img_slug: ManufactureSeoUrl?.keyword ?? null
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
  });

  const productIds = result.map(p => `product_id=${p.product_id}`);
  const seoUrls = await prisma.uvki_seo_url.findMany({
    where: {
      query: { in: productIds },
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isValidSpecial = (special) => {
    const start = new Date(special.date_start);
    const end = new Date(special.date_end);
    const startOk = isNaN(start.getTime()) || start <= today;
    const endOk = isNaN(end.getTime()) || end >= today;
    return startOk && endOk;
  };

  const flatItems = result.map(({ uvki_product_description, uvki_product_special, ...product }) => {
    const validSpecial = uvki_product_special.find(isValidSpecial);

    return {
      ...product,
      name: uvki_product_description[0]?.name ?? null,
      original_price: product.price,
      special_price: validSpecial?.price ?? null,
      slug: slugMap[product.product_id] ?? null,
    };
  });

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


export const getFeaturedProductsService = async () => {

  const productSelect = {
    product_id: true,
    price: true,
    image: true,
    viewed: true,
    date_added: true,
    quantity: true,
    uvki_product_description: {
      where: { language_id: 1 },
      select: { name: true }
    },
    uvki_product_special: {
      select: { price: true },
      orderBy: { priority: "asc" },
      take: 1
    }
  };

  const [latest, special, bestsellersResult] = await Promise.all([


    prisma.uvki_product.findMany({
      where: { status: true },
      orderBy: { date_added: "desc" },
      take: 10,
      select: productSelect
    }),


    prisma.uvki_product.findMany({
      where: {
        status: true,
        uvki_product_special: { some: {} }
      },
      take: 10,
      select: productSelect
    }),

    // ── Bestsellers — order history se raw query ──
    prisma.$queryRaw`
      SELECT 
        p.product_id,
        p.price,
        p.image,
        pd.name,
        p.quantity,
        SUM(op.quantity) as total_sold
      FROM uvki_product p
      JOIN uvki_product_description pd 
        ON p.product_id = pd.product_id AND pd.language_id = 1
      JOIN uvki_order_product op 
        ON p.product_id = op.product_id
      WHERE p.status = 1
      GROUP BY p.product_id, p.price, p.image, pd.name
      ORDER BY total_sold asc
      LIMIT 10
    `
  ]);

  // Resolve slugs for all products
  const allProductIds = [
    ...latest.map(p => p.product_id),
    ...special.map(p => p.product_id),
    ...bestsellersResult.map(p => p.product_id)
  ];

  const seoUrls = await prisma.uvki_seo_url.findMany({
    where: {
      query: { in: allProductIds.map(id => `product_id=${id}`) },
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

  // Clean response
  const formatProduct = (p) => ({
    product_id: p.product_id,
    name: p.uvki_product_description?.[0]?.name || p.name,
    price: p.price,
    special_price: p.uvki_product_special?.[0]?.price ?? null,
    image: p.image,
    slug: slugMap[p.product_id] ?? null,
    quantity: p.quantity,
  });

  return {
    bestsellers: bestsellersResult.map(formatProduct),
    latest: latest.map(formatProduct),
    special: special.map(formatProduct),
  };
};

export const BourbonDataService = async () => {

  const [productsModule, titleModule] = await Promise.all([
    prisma.uvki_journal3_module.findFirst({
      where: {
        module_type: "products",
        module_name: "New in Bourbon - Home Page"
      },
      select: { module_data: true }
    }),
    prisma.uvki_journal3_module.findUnique({
      where: { module_id: 163 },
      select: { module_data: true }
    })
  ]);

  const productsData = JSON.parse(productsModule.module_data);
  const titleData = JSON.parse(titleModule.module_data);


  const productIds = productsData.items[0].filter.products.map(Number);

  const products = await prisma.uvki_product.findMany({
    where: {
      product_id: { in: productIds },
      status: true
    },
    select: {
      product_id: true,
      price: true,
      image: true,
      quantity: true,
      uvki_product_description: {
        where: { language_id: 1 },
        select: { name: true }
      },
      uvki_product_special: {
        select: { price: true },
        orderBy: { priority: "asc" },
        take: 1
      }
    }
  });

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

  return {
    title: titleData.general.title.lang_1,
    description: titleData.general.subtitle.lang_1,
    products: products.map((p) => ({
      product_id: p.product_id,
      name: p.uvki_product_description[0]?.name,
      price: p.price,
      special_price: p.uvki_product_special[0]?.price ?? null,
      image: p.image,
      slug: slugMap[p.product_id] ?? null,
      quantity: p.quantity,
    }))
  };
};

export const getSliderDataService = async () => {
  const sliderModule = await prisma.uvki_journal3_module.findFirst({
    where: {
      module_type: "master_slider",
      module_name: "Slider Top Home"
    },
    select: { module_data: true }
  });

  const data = JSON.parse(sliderModule.module_data);

  const slides = await Promise.all(data.items
    .filter((slide) => slide.status.status === "true")
    .map(async (slide) => {

      const label = slide.items?.find((i) => i.name === "Label");
      const mainText = slide.items?.find((i) => i.name === "Main Text");
      const button = slide.items?.find((i) => i.name === "Button");

      let slug = null;
      if (button?.link?.id && button?.link?.type) {
        const queryMap = {
          'product': `product_id=${button.link.id}`,
          'category': `category_id=${button.link.id}`,
          'manufacturer': `manufacturer_id=${button.link.id}`
        };
        const queryStr = queryMap[button.link.type];
        if (queryStr) {
          const seoUrl = await prisma.uvki_seo_url.findFirst({
            where: { query: queryStr, store_id: 0, language_id: 1 },
            select: { keyword: true }
          });
          slug = seoUrl?.keyword || null;
        }
      }

      return {
        id: slide.id,
        name: slide.name,
        image: slide.image?.lang_1,
        alt: slide.alt?.lang_1,
        label: label?.text?.lang_1,
        title: mainText?.text?.lang_1,
        button_text: button?.text?.lang_1,
        button_link_id: button?.link?.id,
        button_link_type: button?.link?.type,
        slug
      };
    }));

  return { slides };
};

export const getBannersDataService = async () => {
  const bannerModule = await prisma.uvki_journal3_module.findFirst({
    where: {
      module_type: "banners",
      module_name: "Banners Top Home"
    },
    select: { module_data: true }
  });

  const data = JSON.parse(bannerModule.module_data);

  const banners = await Promise.all(data.items
    .filter((item) => item.status.status === "true")
    .map(async (item) => {
      let slug = null;
      if (item.link?.id && item.link?.type) {
        const queryMap = {
          'product': `product_id=${item.link.id}`,
          'category': `category_id=${item.link.id}`,
          'manufacturer': `manufacturer_id=${item.link.id}`
        };
        const queryStr = queryMap[item.link.type];
        if (queryStr) {
          const seoUrl = await prisma.uvki_seo_url.findFirst({
            where: { query: queryStr, store_id: 0, language_id: 1 },
            select: { keyword: true }
          });
          slug = seoUrl?.keyword || null;
        }
      }

      return {
        name: item.name,
        image: item.image?.lang_1,
        alt: item.alt?.lang_1,
        link_type: item.link?.type,
        link_id: item.link?.id,
        slug
      };
    }));

  return { banners };
};

export const writereviewService = async (customer_id, data) => {
  const { product_id, author, text, rating } = data;
  const reviewdata = await prisma.uvki_review.create({
    data: {
      customer_id: customer_id,
      product_id: product_id,
      author: author,
      text: text,
      rating: rating,
      date_added: new Date(),
      date_modified: new Date()
    }
  })

  return reviewdata;
}

export const searchAllProductService = async (query) => {
  const searchText = (query.data).toString().trim();
  const searchInt = parseInt(searchText);
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {
    OR: [
      { model: { contains: searchText } },
      { sku: { contains: searchText } },
      { upc: { contains: searchText } },
      ...(!isNaN(searchInt) ? [{ product_id: { equals: searchInt } }] : []),
      { uvki_product_description: { some: { name: { contains: searchText }, language_id: 1 } } }
    ],
  };

  const [totalItems, searchData] = await Promise.all([
    prisma.uvki_product.count({ where }),
    prisma.uvki_product.findMany({
      where,
      skip,
      take: limit,
      select: {
        product_id: true,
        model: true,
        sku: true,
        price: true,
        status: true,
        image: true,
        uvki_product_description: {
          select: { name: true },
        },
        uvki_product_special: {
          select: {
            price: true,
            date_start: true,
            date_end: true,
          },
        },
      },
    }),
  ]);

  const productIds = searchData.map(p => `product_id=${p.product_id}`);
  const seoUrls = await prisma.uvki_seo_url.findMany({
    where: {
      query: { in: productIds },
      store_id: 0,
      language_id: 1,
    },
    select: { query: true, keyword: true },
  });

  const slugMap = {};
  seoUrls.forEach(s => {
    const id = s.query.split('product_id=')[1];
    slugMap[id] = s.keyword;
  });

  const formatedData = searchData.map((s) => ({
    product_id: s?.product_id,
    model: s?.model,
    sku: s?.sku,
    price: s?.price,
    status: s?.status,
    image: s?.image,
    name: s?.uvki_product_description?.[0]?.name,
    special_price: s?.uvki_product_special?.[0]?.price ?? null,
    slug: slugMap[s.product_id] ?? null,
  }));

  return {
    data: formatedData,
    pagination: {
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / limit),
      current_page: page,
      limit,
    },
  };
};