import { HttpError } from "../../utils/httpError.js";
import { getProductById, listProducts, parseProductId } from "./products.service.js";

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
