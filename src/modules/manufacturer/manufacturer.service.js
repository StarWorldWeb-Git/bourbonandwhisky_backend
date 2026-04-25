
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
            }
        }),
        prisma.uvki_category_description.count(),
    ])

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        items
    }

}