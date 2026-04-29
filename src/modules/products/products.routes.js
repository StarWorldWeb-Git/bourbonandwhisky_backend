import { Router } from "express";
import {
  getProductByIdController,
  listProductsController,
  MostViewedProductsController,
} from "./products.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const productsRouter = Router();

productsRouter.get("/", asyncHandler(listProductsController));
productsRouter.get("/most-viewed", asyncHandler(MostViewedProductsController));
productsRouter.get("/:id", asyncHandler(getProductByIdController));
export default productsRouter;
