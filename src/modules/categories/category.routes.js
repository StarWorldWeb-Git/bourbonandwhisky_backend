import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { besetSellingGiftset, listingCategoriesController, showGiftBasketsCategory, showGiftByCategroy, showLimitCategoriesController, showProductByCategoryId, showTopCategory } from "./category.controller.js";



const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(listingCategoriesController));
categoriesRouter.get("/gift-category", asyncHandler(showLimitCategoriesController));
categoriesRouter.get("/top-category",showTopCategory)
categoriesRouter.get("/top-category",showTopCategory)
categoriesRouter.get("/gifts-baskets-category",showGiftBasketsCategory)
categoriesRouter.get("/gifts-by-category",showGiftByCategroy)
categoriesRouter.get("/best-selling-giftset",besetSellingGiftset)
categoriesRouter.get("/:identifier",asyncHandler(showProductByCategoryId))
export default categoriesRouter;