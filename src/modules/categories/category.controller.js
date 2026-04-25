
import { listingCategoriesServices } from "./category.service.js";



 export const listingCategoriesController = async (req, res) => {
    const result = await listingCategoriesServices(req.query);
    res.json(result);
};