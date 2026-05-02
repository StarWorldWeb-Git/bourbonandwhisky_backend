import { successResponse } from "../../utils/apiResponse.js";
import { CustomerOrderDetailsByOrderIdServices, orderhistoryservice } from "./order.service.js"


 export const CustomerOrderHistory =  async(req,res)=>{
  const orderData = await orderhistoryservice(req) ;
  return successResponse(res,200,"",orderData)
}

 export const CustomerOrderDetailsByOrderId = async(req,res)=>{
    
    const orderId = Number(req.params.id );

    const orderDetailsByOrder = await CustomerOrderDetailsByOrderIdServices(orderId);
    return successResponse(res,200,"",orderDetailsByOrder);
 }