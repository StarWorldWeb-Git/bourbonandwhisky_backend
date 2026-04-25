import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { listingCategoriesController } from "./category.controller.js";



const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(listingCategoriesController));

export default categoriesRouter;