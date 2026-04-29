import { Router } from "express";
import {
  CountProductViewedController,
  getProductByIdController,
  listProductsController,
  MostViewedProductsController,
} from "./products.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const productsRouter = Router();

productsRouter.get("/", asyncHandler(listProductsController));
productsRouter.get("/most-viewed", asyncHandler(MostViewedProductsController));
productsRouter.get("/:id", asyncHandler(getProductByIdController));
productsRouter.put("/:id/count-viewed", asyncHandler(CountProductViewedController));
export default productsRouter;
