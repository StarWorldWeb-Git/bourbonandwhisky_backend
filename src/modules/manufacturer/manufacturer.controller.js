import { lisdtingManufacturersService } from "./manufacturer.service.js"

export const lisdtingManufacturersController = async (req, res) => {
   const result = await lisdtingManufacturersService(req.query);

   res.json(result)
}