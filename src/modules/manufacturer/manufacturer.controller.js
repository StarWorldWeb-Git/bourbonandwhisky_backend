import { lisdtingManufacturersService, listingAllManufacturersService } from "./manufacturer.service.js"

export const lisdtingManufacturersController = async (req, res) => {
   const result = await lisdtingManufacturersService(req.query);

   res.json(result)
}
export const lisdtingAllManufacturersController = async (req, res) => {
   const result = await listingAllManufacturersService(req.query);

   res.json(result)
}