import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { listingCategoriesController, showGiftBasketsCategory, showGiftByCategroy, showLimitCategoriesController, showProductByCategoryId, showTopCategory } from "./category.controller.js";



const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(listingCategoriesController));
categoriesRouter.get("/gift-category", asyncHandler(showLimitCategoriesController));
categoriesRouter.get("/top-category",showTopCategory)
categoriesRouter.get("/top-category",showTopCategory)
categoriesRouter.get("/gifts-baskets-category",showGiftBasketsCategory)
categoriesRouter.get("/gifts-by-category",showGiftByCategroy)
categoriesRouter.get("/:id",asyncHandler(showProductByCategoryId))
export default categoriesRouter;