import { Router } from "express";
import {
  bestSellerProduct,
  BourbonData,
  CountProductViewedController,
  getProductByIdController,
  listProductsController,
  MostViewedProductsController,
} from "./products.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const productsRouter = Router();

productsRouter.get("/", asyncHandler(listProductsController));
productsRouter.get("/most-viewed", asyncHandler(MostViewedProductsController));
productsRouter.get("/best-letest-special",asyncHandler(bestSellerProduct))
productsRouter.get("/top-bourbon-products",asyncHandler(BourbonData))
productsRouter.get("/:id", asyncHandler(getProductByIdController));
productsRouter.put("/:id/count-viewed", asyncHandler(CountProductViewedController));
export default productsRouter;
