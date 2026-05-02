import { Router } from "express";
import { CustomerOrderDetailsByOrderId, CustomerOrderHistory } from "./order.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";


const orderRouter = Router();

orderRouter.get('/order-history',authMiddleware ,asyncHandler(CustomerOrderHistory))
orderRouter.get('/order-info/:id',authMiddleware,asyncHandler(CustomerOrderDetailsByOrderId))

export default orderRouter ;