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
      product_id: true,
      uvki_product_description: {
        where: { language_id: languageId },
        take: 1,
      },
      uvki_product_image: {
        select: { image: true },
        orderBy: { sort_order: "asc" },
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
    brandImg: product.uvki_manufacturer?.image ?? null,
    manufacturer_id: product.uvki_manufacturer?.manufacturer_id ?? null,
    product_review: product?.uvki_review.map((p) => ({
      author: p?.author,
      text: p?.text,
      rating: p?.rating,
      date_added: p?.date_added
    }))
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
    uvki_product_description: {
      where: { language_id: 1 },
      select: { name: true }
    },
    uvki_product_special: {  // special price
      select: { price: true },
      orderBy: { priority: "asc" },
      take: 1
    }
  };

  const [latest, special, bestsellers] = await Promise.all([

    // ── Latest Products — date_added se ──
    prisma.uvki_product.findMany({
      where: { status: true },
      orderBy: { date_added: "desc" },
      take: 10,
      select: productSelect
    }),

    // ── Special Deals — uvki_product_special table se ──
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

  // Clean response
  const formatProduct = (p) => ({
    product_id: p.product_id,
    name: p.uvki_product_description?.[0]?.name,
    price: p.price,
    special_price: p.uvki_product_special?.[0]?.price ?? null,
    image: p.image,
  });

  return {
    bestsellers,
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

  return {
    title: titleData.general.title.lang_1,
    description: titleData.general.subtitle.lang_1,
    products: products.map((p) => ({
      product_id: p.product_id,
      name: p.uvki_product_description[0]?.name,
      price: p.price,
      special_price: p.uvki_product_special[0]?.price ?? null,
      image: p.image,
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

  const slides = data.items
    .filter((slide) => slide.status.status === "true")
    .map((slide) => {

      const label = slide.items?.find((i) => i.name === "Label");
      const mainText = slide.items?.find((i) => i.name === "Main Text");
      const button = slide.items?.find((i) => i.name === "Button");

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
      };
    });

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

  const banners = data.items
    .filter((item) => item.status.status === "true")
    .map((item) => ({
      name: item.name,
      image: item.image?.lang_1,
      alt: item.alt?.lang_1,
      link_type: item.link?.type,
      link_id: item.link?.id,
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
  const where = {
    OR: [
      { model: { contains: searchText } },
      { sku: { contains: searchText } },
      { upc: { contains: searchText } },
      { uvki_product_description: { some: { name: { contains: searchText }, language_id: 1 } } }
    ],
  }


  const searchData = await prisma.uvki_product.findMany({
    where: where,
    select: {
      product_id: true,
      model: true,
      sku: true,
      price: true,
      status: true,
      image: true,
      uvki_product_description: {
        select: {
          name: true,
        }
      },
      uvki_product_special: {
        select: {
          price: true,
          date_start: true,
          date_end: true,
        }
      }
    }
  })

  const formatedData = searchData.map((s) => ({
    product_id: s?.product_id,
    model: s?.model,
    sku: s?.sku,
    price: s?.price,
    status: s?.status,
    image: s?.image,
    name: s?.uvki_product_description?.[0]?.name,
    special_price: s?.uvki_product_special?.[0]?.price ?? null,

  }))
  return formatedData;
}