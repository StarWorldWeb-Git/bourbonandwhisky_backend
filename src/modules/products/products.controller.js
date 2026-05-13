import { prisma } from "../../../lib/prisma.js";
import { successResponse } from "../../utils/apiResponse.js";
import { HttpError } from "../../utils/httpError.js";
import { BourbonDataService, countProductViewedService, getBannersDataService, getFeaturedProductsService, getProductById, getSliderDataService, listProducts, mostviewdproductservice, parseProductId, writereviewService } from "./products.service.js";

export const listProductsController = async (req, res) => {
  const result = await listProducts(req.query);
  res.json({
    success: true,
    ...result,
  });
}

export const getProductByIdController = async (req, res) => {
  const productId = parseProductId(req.params.id);
  const languageId = Number.parseInt(req.query.language_id, 10) || 1;
  if (productId === 0) {
    throw new HttpError(400, "Invalid product id");
  }

  const product = await getProductById(productId, languageId);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }



  res.json({
    success: true,
    item: product,
  });
}

export const MostViewedProductsController = async (req, res) => {

  const result = await mostviewdproductservice();
  res.json({
    success: true,
    items: result,
  });
}

export const CountProductViewedController = async (req, res) => {
  const result = await countProductViewedService(req.params);
  res.json({
    success: true,
    items: result,
  });
}

export const bestSellerProduct = async (req, res) => {
  const result = await getFeaturedProductsService();
  return successResponse(res, 200, "", result)
}

export const BourbonData = async (req, res) => {
  const result = await BourbonDataService();
  return successResponse(res, 200, "", result)
}

export const HomePageSlider = async (req, res) => {
  const result = await getSliderDataService();
  return successResponse(res, 200, "", result)
}
export const HomePageBanner = async (req, res) => {
  const result = await getBannersDataService();
  return successResponse(res, 200, "", result)
}

export const writeReviewProduct = async (req, res) => {

  const customer_id = req.customer.customer_id;
  const result = await writereviewService(customer_id, req.body);
  return successResponse(res, 200, "Thank You For Your Review!", result)
}