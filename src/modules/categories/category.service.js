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
            select:{
                name : true,
                category_id : true, 
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
  const result = await prisma.uvki_category_description.findMany({
    where: {
      category_id: { in: categoryIds },
      language_id: 1,
    },
    orderBy: {
      category_id: "asc",
    },
    select: {
      name: true,
      category_id: true,
      language_id: true,
    },
  });

  return result;
};