import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getShopByBrands, lisdtingAllManufacturersController, lisdtingManufacturersController, lisdtingManufacturersForFilterController, showProductByManufacturerId } from "./manufacturer.controller.js";


const manufacturerRouter =  Router();


manufacturerRouter.get("/",asyncHandler(lisdtingManufacturersController)) ;
manufacturerRouter.get("/for-filter",asyncHandler(lisdtingManufacturersForFilterController)) ;
manufacturerRouter.get("/all",asyncHandler(lisdtingAllManufacturersController)) ;
manufacturerRouter.get('/shop-by-brands', getShopByBrands);
manufacturerRouter.get("/:identifier", asyncHandler(showProductByManufacturerId));


export default manufacturerRouter ; 