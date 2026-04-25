import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { lisdtingManufacturersController } from "./manufacturer.controller.js";


const manufacturerRouter =  Router();


manufacturerRouter.get("/",asyncHandler(lisdtingManufacturersController)) ;



export default manufacturerRouter ; 