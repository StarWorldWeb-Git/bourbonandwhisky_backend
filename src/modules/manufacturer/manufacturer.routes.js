import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { lisdtingAllManufacturersController, lisdtingManufacturersController, showProductByManufacturerId } from "./manufacturer.controller.js";


const manufacturerRouter =  Router();


manufacturerRouter.get("/",asyncHandler(lisdtingManufacturersController)) ;
manufacturerRouter.get("/all",asyncHandler(lisdtingAllManufacturersController)) ;
manufacturerRouter.get("/:identifier", asyncHandler(showProductByManufacturerId));


export default manufacturerRouter ; 