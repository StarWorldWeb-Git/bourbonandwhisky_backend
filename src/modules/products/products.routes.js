import { Router } from "express";
import {
  getProductByIdController,
  listProductsController,
} from "./products.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const productsRouter = Router();

productsRouter.get("/", asyncHandler(listProductsController));
productsRouter.get("/:id", asyncHandler(getProductByIdController));

export default productsRouter;
