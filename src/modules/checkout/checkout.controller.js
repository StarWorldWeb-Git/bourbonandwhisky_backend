import { successResponse } from "../../utils/apiResponse.js";
import { placeOrderService } from "./checkout.service.js";

// ─────────────────────────────────────────
export const placeOrder = async (req, res) => {

    const body = req.body;
    const { customer, billing, shipping, payment, shippingMethod } = body;

    if (!body.products || !Array.isArray(body.products) || body.products.length === 0) {
        return res.status(400).json({ success: false, message: "Products empty hain" });
    }

    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.socket?.remoteAddress || "";

    const result = await placeOrderService({
        // ── Customer ──
        customer_id: customer?.id ?? body.customer_id ?? 0,
        customer_group_id: customer?.group_id ?? body.customer_group_id ?? 1,
        firstname: customer?.firstname ?? body.firstname,
        lastname: customer?.lastname ?? body.lastname,
        email: customer?.email ?? body.email,
        telephone: customer?.telephone ?? body.telephone,
        custom_field: customer?.custom_field ?? body.custom_field ?? {},

        // ── Billing ──
        payment_firstname: billing?.firstname ?? body.payment_firstname,
        payment_lastname: billing?.lastname ?? body.payment_lastname,
        payment_company: billing?.company ?? body.payment_company ?? "",
        payment_address_1: billing?.address_1 ?? body.payment_address_1,
        payment_address_2: billing?.address_2 ?? body.payment_address_2 ?? "",
        payment_city: billing?.city ?? body.payment_city,
        payment_postcode: billing?.postcode ?? body.payment_postcode ?? "",
        payment_zone: billing?.zone ?? body.payment_zone,
        payment_zone_id: billing?.zone_id ?? body.payment_zone_id,
        payment_country: billing?.country ?? body.payment_country,
        payment_country_id: billing?.country_id ?? body.payment_country_id,
        payment_address_format: billing?.address_format ?? body.payment_address_format ?? "",
        payment_custom_field: billing?.custom_field ?? body.payment_custom_field ?? {},
        payment_method: payment?.method ?? body.payment_method,
        payment_code: payment?.code ?? body.payment_code,

        // ── Shipping ──
        shipping_firstname: shipping?.firstname ?? body.shipping_firstname ?? "",
        shipping_lastname: shipping?.lastname ?? body.shipping_lastname ?? "",
        shipping_company: shipping?.company ?? body.shipping_company ?? "",
        shipping_address_1: shipping?.address_1 ?? body.shipping_address_1 ?? "",
        shipping_address_2: shipping?.address_2 ?? body.shipping_address_2 ?? "",
        shipping_city: shipping?.city ?? body.shipping_city ?? "",
        shipping_postcode: shipping?.postcode ?? body.shipping_postcode ?? "",
        shipping_zone: shipping?.zone ?? body.shipping_zone ?? "",
        shipping_zone_id: shipping?.zone_id ?? body.shipping_zone_id ?? 0,
        shipping_country: shipping?.country ?? body.shipping_country ?? "",
        shipping_country_id: shipping?.country_id ?? body.shipping_country_id ?? 0,
        shipping_address_format: shipping?.address_format ?? body.shipping_address_format ?? "",
        shipping_custom_field: shipping?.custom_field ?? body.shipping_custom_field ?? {},
        shipping_method: shippingMethod?.name ?? body.shipping_method ?? "",
        shipping_code: shippingMethod?.code ?? body.shipping_code ?? "",
        shipping_cost: shippingMethod?.cost ?? body.shipping_cost ?? 0,

        // ── Rest ──
        products: body.products,
        totals: body.totals ?? null,
        comment: body.comment ?? "",
        language_id: body.language_id ?? 1,
        currency_id: body.currency_id ?? 1,
        currency_code: body.currency_code ?? "USD",
        currency_value: body.currency_value ?? 1.0,
        ip,
    });

    return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: {
            order_id: result.order_id,
            total: result.total,
        },
    });
};

// // ─────────────────────────────────────────
// // PATCH /api/checkout/status/:order_id
// // ─────────────────────────────────────────
// const updateOrderStatus = async (req, res) => {
//     try {
//         const order_id = parseInt(req.params.order_id);
//         const { status_id } = req.body;

//         if (!order_id || isNaN(order_id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid order_id required hai",
//             });
//         }

//         if (!status_id || typeof status_id !== "number") {
//             return res.status(400).json({
//                 success: false,
//                 message: "status_id (number) required hai",
//             });
//         }

//         const result = await checkoutService.updateOrderStatus(order_id, status_id);

//         return res.status(200).json({
//             success: true,
//             message: "Order status updated",
//             data: result,
//         });
//     } catch (error) {
//         console.error("Status Update Error:", error.message);
//         return res.status(500).json({
//             success: false,
//             message: "Status update nahi ho saka.",
//         });
//     }
// };

// // ─────────────────────────────────────────
// // GET /api/checkout/:order_id
// // ─────────────────────────────────────────
// const getOrderById = async (req, res) => {
//     try {
//         const order_id = parseInt(req.params.order_id);

//         if (!order_id || isNaN(order_id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid order_id required hai",
//             });
//         }

//         const order = await checkoutService.getOrderById(order_id);

//         return res.status(200).json({
//             success: true,
//             data: order,
//         });
//     } catch (error) {
//         console.error("Get Order Error:", error.message);
//         return res.status(404).json({
//             success: false,
//             message: error.message ?? "Order nahi mila",
//         });
//     }
// };

