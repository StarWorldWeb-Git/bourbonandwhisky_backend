
import { successResponse } from "../../utils/apiResponse.js";
import { getHomepageDataService, listingCategoriesServices, showGiftBasketsSerivce, showLimitCategoriesServices, showProductByCategoriesIdService } from "./category.service.js";



export const listingCategoriesController = async (req, res) => {
    const result = await listingCategoriesServices(req.query);
    res.json(result);
};

export const showLimitCategoriesController = async (req, res) => {
    const result = await showLimitCategoriesServices(req.query);
    res.json(result);
};

export const showProductByCategoryId = async (req, res) => {

    const category_id = parseInt(req.params.id)
    const products = await showProductByCategoriesIdService(category_id);

    return successResponse(res, 200, "", products)
}

export const showTopCategory = async (req, res) => {

    const category = await getHomepageDataService();
    return successResponse(res, 200, "", category)

}

export const showGiftBasketsCategory = async (req,res) => {
const result  =  await showGiftBasketsSerivce();
return successResponse(res,200,"",result)
}