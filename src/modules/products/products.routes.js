import { Router } from "express";
import {
  bestSellerProduct,
  BourbonData,
  CountProductViewedController,
  getProductByIdController,
  HomePageBanner,
  HomePageSlider,
  listProductsController,
  MostViewedProductsController,
  writeReviewProduct,
} from "./products.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const productsRouter = Router();

productsRouter.get("/", asyncHandler(listProductsController));
productsRouter.get("/most-viewed", asyncHandler(MostViewedProductsController));
productsRouter.get("/best-letest-special",asyncHandler(bestSellerProduct))
productsRouter.get("/top-bourbon-products",asyncHandler(BourbonData))
productsRouter.get("/home-page-slider",asyncHandler(HomePageSlider))
productsRouter.get("/home-page-banner",asyncHandler(HomePageBanner))
productsRouter.post("/product-review",authMiddleware ,asyncHandler(writeReviewProduct))
productsRouter.get("/:id", asyncHandler(getProductByIdController));
productsRouter.put("/:id/count-viewed", asyncHandler(CountProductViewedController));
export default productsRouter;
