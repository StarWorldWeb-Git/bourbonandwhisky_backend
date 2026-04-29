import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { listingCategoriesController, showLimitCategoriesController } from "./category.controller.js";



const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(listingCategoriesController));
categoriesRouter.get("/limit", asyncHandler(showLimitCategoriesController));
export default categoriesRouter;