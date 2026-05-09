import {Router} from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { placeOrder } from './checkout.controller.js';


const checkoutRouter  =  Router()

checkoutRouter.post("/", authMiddleware, asyncHandler(placeOrder));

export default checkoutRouter ;


// // ── Get order by ID ──
// // GET /api/checkout/:order_id
// router.get("/:order_id", checkoutController.getOrderById);

// // ── Update order status ──
// // PATCH /api/checkout/status/:order_id
// router.patch("/status/:order_id", checkoutController.updateOrderStatus);

