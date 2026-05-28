import { prisma } from "../../../lib/prisma.js";
import { successResponse } from "../../utils/apiResponse.js";
import { HttpError } from "../../utils/httpError.js";
import { getShopByBrandsService, lisdtingManufacturersService, lisdtingManufacturersServiceForFilter, listingAllManufacturersService, showProductByManufacturerIdService } from "./manufacturer.service.js"

export const lisdtingManufacturersController = async (req, res) => {
   const result = await lisdtingManufacturersService(req.query);

   res.json(result)
}
export const lisdtingManufacturersForFilterController = async (req, res) => {
   const result = await lisdtingManufacturersServiceForFilter(req.query);
   res.json(result)
}
export const lisdtingAllManufacturersController = async (req, res) => {
   const result = await listingAllManufacturersService(req.query);

   res.json(result)
}

export const showProductByManufacturerId = async (req, res) => {
    const { identifier } = req.params;
    const languageId = Number.parseInt(req.query.language_id, 10) || 1;

    let manufacturerId = null;
    const isNumeric = /^\d+$/.test(identifier);

    if (isNumeric) {
        manufacturerId = parseInt(identifier);
    } else {
        const seoUrl = await prisma.uvki_seo_url.findFirst({
            where: {
                keyword: identifier,
                store_id: 0,
                language_id: languageId,
            }
        });

        if (seoUrl?.query?.startsWith('manufacturer_id=')) {
            manufacturerId = parseInt(seoUrl.query.split('manufacturer_id=')[1]);
        }
    }

    if (!manufacturerId) throw new HttpError(404, "Manufacturer not found");

    const products = await showProductByManufacturerIdService(manufacturerId, req.query);

    return successResponse(res, 200, "", products)
}

export const getShopByBrands = async (req, res) => {
  try {
    const moduleId = 287; // Shop by Brands module_id
    const data = await getShopByBrandsService(moduleId, req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};