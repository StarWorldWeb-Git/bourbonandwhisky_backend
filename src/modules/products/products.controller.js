import { prisma } from "../../../lib/prisma.js";
import { successResponse } from "../../utils/apiResponse.js";
import { HttpError } from "../../utils/httpError.js";
import { BourbonDataService, countProductViewedService, getBannersDataService, getFeaturedProductsService, getProductById, getSliderDataService, listProducts, mostviewdproductservice, parseProductId, searchAllProductService, writereviewService } from "./products.service.js";

export const listProductsController = async (req, res) => {
  const result = await listProducts(req.query);
  res.json({
    success: true,
    ...result,
  });
}

export const getProductByIdController = async (req, res) => {
  const { identifier } = req.params;
  const languageId = Number.parseInt(req.query.language_id, 10) || 1;

  const isNumeric = /^\d+$/.test(identifier);

  if (isNumeric) {
    const productId = parseProductId(identifier);
    if (productId === 0) throw new HttpError(400, "Invalid product id");
    const product = await getProductById(productId, languageId);
    if (!product) throw new HttpError(404, "Product not found");
    return res.json({ success: true, item: product });
  } else {
    const seoUrl = await prisma.uvki_seo_url.findFirst({
      where: {
        keyword: identifier,
        store_id: 0,
        language_id: languageId,
      }
    });

    if (!seoUrl) {
      throw new HttpError(404, "Not found");
    }

    if (seoUrl.query.startsWith('product_id=')) {
      const productId = parseInt(seoUrl.query.split('product_id=')[1]);
      const product = await getProductById(productId, languageId);
      if (!product) throw new HttpError(404, "Product not found");
      return res.json({ success: true, item: product });
    }


    if (seoUrl.query.startsWith('category_id=')) {
      const categoryId = parseInt(seoUrl.query.split('category_id=')[1]);
      const result = await listProducts({ ...req.query, category_id: categoryId });
      return res.json({ success: true, ...result });
    }

    if (seoUrl.query.startsWith('manufacturer_id=')) {
      const manufacturerId = parseInt(seoUrl.query.split('manufacturer_id=')[1]);
      const result = await listProducts({ ...req.query, manufacturer_id: manufacturerId });
      return res.json({ success: true, ...result });
    }
  }

  throw new HttpError(404, "Not found");
};

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

export const searchAllProduct = async (req, res) => {
  const result = await searchAllProductService(req.query);
  return successResponse(res, 200, "", result)
}


