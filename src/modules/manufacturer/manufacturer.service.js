
import { prisma } from "../../../lib/prisma.js";
import { parsePositiveInt } from "../../utils/parsePostiveInt.js";


const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export const lisdtingManufacturersService = async (query) => {

    const page = parsePositiveInt(query.page, 1);
    const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const offset = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
        prisma.uvki_manufacturer.findMany({
            skip: offset,
            take: limit,
            orderBy: {
                manufacturer_id: "asc"
            },
            select: {
                name: true,
                manufacturer_id: true,
                image:true
            }
        }),
        prisma.uvki_category_description.count(),
    ])

    const itemsWithSlugs = await Promise.all(items.map(async (m) => {
        const seoUrl = await prisma.uvki_seo_url.findFirst({
            where: {
                query: `manufacturer_id=${m.manufacturer_id}`,
                store_id: 0,
                language_id: 1,
            },
            select: { keyword: true }
        });
        return {
            ...m,
            slug: seoUrl?.keyword || null
        };
    }));

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        items: itemsWithSlugs
    }

}


export const listingAllManufacturersService = async (query) => {
    const page = parsePositiveInt(query.page, 1);
    const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const offset = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
        prisma.uvki_manufacturer.findMany({
            skip: offset,
            take: limit,
            orderBy: {
                name: "asc"
            },
            select: {
                name: true,
                manufacturer_id: true,
                image: true
            }
        }),
        prisma.uvki_manufacturer.count()
    ])

    const itemsWithSlugs = await Promise.all(items.map(async (m) => {
        const seoUrl = await prisma.uvki_seo_url.findFirst({
            where: {
                query: `manufacturer_id=${m.manufacturer_id}`,
                store_id: 0,
                language_id: 1,
            },
            select: { keyword: true }
        });
        return {
            ...m,
            slug: seoUrl?.keyword || null
        };
    }));

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        items: itemsWithSlugs
    }
}   
   
export const showProductByManufacturerIdService = async (manufacturer_id, query = {}) => {
    const DEFAULT_LIMIT = 12;
    const MAX_LIMIT = 100;

    const page = parsePositiveInt(query.page, 1);
    const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const offset = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
        prisma.uvki_product.findMany({
            where: {
                manufacturer_id: manufacturer_id,
                status: true,
            },
            skip: offset,
            take: limit,
            orderBy: {
                product_id: "desc",
            },
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
        }),
        prisma.uvki_product.count({
            where: {
                manufacturer_id: manufacturer_id,
                status: true,
            },
        }),
    ]);

    const products = await Promise.all(items.map(async (p) => {
        const seoUrl = await prisma.uvki_seo_url.findFirst({
            where: {
                query: `product_id=${p.product_id}`,
                store_id: 0,
                language_id: 1,
            },
            select: { keyword: true }
        });
        return {
            product_id: p.product_id,
            price: p.price,
            image: p.image,
            name: p.uvki_product_description[0]?.name || null,
            slug: seoUrl?.keyword || null,
            special_price: p.uvki_product_special[0]?.price || null,
            special_price_start_date: p.uvki_product_special[0]?.date_start || null,
            special_price_end_date: p.uvki_product_special[0]?.date_end || null,
        };
    }));

    return {
        data: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
   
  