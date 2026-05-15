import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getShopByBrands, lisdtingAllManufacturersController, lisdtingManufacturersController, showProductByManufacturerId } from "./manufacturer.controller.js";


const manufacturerRouter =  Router();


manufacturerRouter.get("/",asyncHandler(lisdtingManufacturersController)) ;
manufacturerRouter.get("/all",asyncHandler(lisdtingAllManufacturersController)) ;
manufacturerRouter.get('/shop-by-brands', getShopByBrands);
manufacturerRouter.get("/:identifier", asyncHandler(showProductByManufacturerId));


export default manufacturerRouter ; 