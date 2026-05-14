
import { prisma } from "../../../lib/prisma.js";
import { successResponse } from "../../utils/apiResponse.js";
import { HttpError } from "../../utils/httpError.js";
import { getBestSellingGiftSetService, getHomepageDataService, listingCategoriesServices, showGiftBasketsSerivce, showGiftByBrandService, showLimitCategoriesServices, showProductByCategoriesIdService } from "./category.service.js";

export const listingCategoriesController = async (req, res) => {
    const result = await listingCategoriesServices(req.query);
    res.json(result);
};

export const showLimitCategoriesController = async (req, res) => {
    const result = await showLimitCategoriesServices(req.query);
    res.json(result);
};

export const showProductByCategoryId = async (req, res) => {
    const { identifier } = req.params;
    const languageId = Number.parseInt(req.query.language_id, 10) || 1;

    let categoryId = null;
    const isNumeric = /^\d+$/.test(identifier);

    if (isNumeric) {
        categoryId = parseInt(identifier);
    } else {
        const seoUrl = await prisma.uvki_seo_url.findFirst({
            where: {
                keyword: identifier,
                store_id: 0,
                language_id: languageId,
            }
        });

        if (seoUrl?.query?.startsWith('category_id=')) {
            categoryId = parseInt(seoUrl.query.split('category_id=')[1]);
        }
    }

    if (!categoryId) throw new HttpError(404, "Category not found");

    const products = await showProductByCategoriesIdService(categoryId, req.query);

    return successResponse(res, 200, "", products)
}

export const showTopCategory = async (req, res) => {

    const category = await getHomepageDataService();
    return successResponse(res, 200, "", category)

}

export const showGiftBasketsCategory = async (req, res) => {
    const result = await showGiftBasketsSerivce();
    return successResponse(res, 200, "", result)
}


export const showGiftByCategroy = async (req, res) => {
    const result = await showGiftByBrandService();
    return successResponse(res, 200, "", result)
}

export const besetSellingGiftset = async (req, res) => {

    const result = await getBestSellingGiftSetService();
    return successResponse(res, 200, "", result)
}