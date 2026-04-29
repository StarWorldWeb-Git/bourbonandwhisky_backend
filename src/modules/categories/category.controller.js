
import { listingCategoriesServices, showLimitCategoriesServices } from "./category.service.js";



 export const listingCategoriesController = async (req, res) => {
    const result = await listingCategoriesServices(req.query);
    res.json(result);
};

export const showLimitCategoriesController = async (req, res) => {
    const result = await showLimitCategoriesServices(req.query);
    res.json(result);
};