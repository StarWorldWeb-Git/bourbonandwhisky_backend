import { prisma } from "../../../lib/prisma.js";
import { transporter } from "../../config/nodemiller.js";
import { generateOrderConfirmationEmail } from "../../utils/Orderconfirmationemail.js";
import { ORDER_STATUS } from "../../utils/orderStatus.js";




// ─────────────────────────────────────────────────────────────
// INTERNAL HELPER: totals array banao (OpenCart ki tarah)
// confirm.php mein extensions se aata hai — hum manually banate hain
// ─────────────────────────────────────────────────────────────
const buildTotals = (products, shippingCost = 0) => {
    const subTotal = products.reduce(
        (sum, p) => sum + parseFloat(p.price) * parseInt(p.quantity),
        0
    );

    const totals = [
        {
            code: "sub_total",
            title: "Sub-Total",
            value: subTotal,
            sort_order: 1,
        },
    ];

    if (shippingCost > 0) {
        totals.push({
            code: "shipping",
            title: "Flat Shipping Rate",
            value: shippingCost,
            sort_order: 3,
        });
    }

    const grandTotal = subTotal + shippingCost;

    totals.push({
        code: "total",
        title: "Total",
        value: grandTotal,
        sort_order: 9,
    });

    return { totals, grandTotal };
};




export const placeOrderService = async (orderData) => {
    const {

        invoice_prefix = "",
        store_id = 0,
        store_name = "",
        store_url = "",


        customer_id = 0,
        customer_group_id = 1,
        firstname,
        lastname,
        email,
        telephone,
        custom_field = {},


        payment_firstname,
        payment_lastname,
        payment_company = "",
        payment_address_1,
        payment_address_2 = "",
        payment_city,
        payment_postcode = "",
        payment_zone,
        payment_zone_id,
        payment_country,
        payment_country_id,
        payment_address_format = "",
        payment_custom_field = {},
        payment_method,
        payment_code,


        shipping_firstname = "",
        shipping_lastname = "",
        shipping_company = "",
        shipping_address_1 = "",
        shipping_address_2 = "",
        shipping_city = "",
        shipping_postcode = "",
        shipping_zone = "",
        shipping_zone_id = 0,
        shipping_country = "",
        shipping_country_id = 0,
        shipping_address_format = "",
        shipping_custom_field = {},
        shipping_method = "",
        shipping_code = "",

        products = [],

        // ── Totals
        totals = null,

        // ── Misc ──
        comment = "",
        affiliate_id = 0,
        commission = 0,
        marketing_id = 0,
        tracking = "",
        language_id = 1,
        currency_id = 1,
        currency_code = "USD",
        currency_value = 1.0,
        ip = "",
        forwarded_ip = "",
        user_agent = "",
        accept_language = "",

        shipping_cost = 0,
    } = orderData;


    const { totals: builtTotals, grandTotal } = totals
        ? {
            totals,
            grandTotal:
                totals.find((t) => t.code === "total")?.value ?? 0,
        }
        : buildTotals(products, shipping_cost);

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {

        const order = await tx.uvki_order.create({
            data: {
                invoice_no: 0,
                invoice_prefix,
                store_id,
                store_name: store_name || (process.env.STORE_NAME ?? ""),
                store_url: store_url || (process.env.STORE_URL ?? ""),

                customer_id,
                customer_group_id,
                firstname,
                lastname,
                email,
                telephone,
                fax: "",
                custom_field: JSON.stringify(custom_field),

                payment_firstname,
                payment_lastname,
                payment_company,
                payment_address_1,
                payment_address_2,
                payment_city,
                payment_postcode,
                payment_zone,
                payment_zone_id,
                payment_country,
                payment_country_id,
                payment_address_format,
                payment_custom_field: JSON.stringify(payment_custom_field),
                payment_method,
                payment_code,

                shipping_firstname,
                shipping_lastname,
                shipping_company,
                shipping_address_1,
                shipping_address_2,
                shipping_city,
                shipping_postcode,
                shipping_zone,
                shipping_zone_id,
                shipping_country,
                shipping_country_id,
                shipping_address_format,
                shipping_custom_field: JSON.stringify(shipping_custom_field),
                shipping_method,
                shipping_code,

                comment,
                total: grandTotal,
                order_status_id: 0,
                affiliate_id,
                commission,
                marketing_id,
                tracking,
                language_id,
                currency_id,
                currency_code,
                currency_value,
                ip,
                forwarded_ip,
                user_agent,
                accept_language,
                date_added: now,
                date_modified: now,
            },
        });

        const order_id = order.order_id;

        for (const product of products) {
            const orderProduct = await tx.uvki_order_product.create({
                data: {
                    order_id,
                    product_id: parseInt(product.product_id),
                    name: product.name,
                    model: product.model,
                    quantity: parseInt(product.quantity),
                    price: parseFloat(product.price),
                    total: parseFloat(product.total ?? product.price * product.quantity),
                    tax: parseFloat(product.tax ?? 0),
                    reward: parseInt(product.reward ?? 0),
                },
            });


            const optionList = product.option ?? product.options ?? [];

            for (const option of optionList) {
                await tx.uvki_order_option.create({
                    data: {
                        order_id,
                        order_product_id: orderProduct.order_product_id,
                        product_option_id: parseInt(option.product_option_id),
                        product_option_value_id: parseInt(option.product_option_value_id ?? 0),
                        name: option.name,
                        value: String(option.value),
                        type: option.type,
                    },
                });
            }
        }



        await tx.uvki_order_total.createMany({
            data: builtTotals.map((t) => ({
                order_id,
                code: t.code,
                title: t.title,
                value: parseFloat(t.value),
                sort_order: parseInt(t.sort_order),
            })),
        });



        await tx.uvki_order.update({
            where: { order_id },
            data: { order_status_id: ORDER_STATUS.PENDING, date_modified: now },
        });

        await tx.uvki_order_history.create({
            data: {
                order_id,
                order_status_id: ORDER_STATUS.PENDING,
                notify: false,
                comment: "",
                date_added: now,
            },
        });

        await tx.ks_uvki_order.create({
            data: {
                order_id,
                product_name: products.map((p) => p.name).join(", "),
                state_code: shipping_zone ?? "",
                first_name: firstname,
                last_name: lastname,
                shipping_firstname,
                shipping_lastname,
                email,
                telephone,
                quantity: products.map((p) => String(p.quantity)).join(", "),
                model: products.map((p) => p.model).join(", "),
                shipping_city,
                shipping_zone,
                comment,
                status: "Pending",
                remark: "",
                status_updated_date: now,
                tracking_number: "",
                order_status_id: ORDER_STATUS.PENDING,
                order_source: "website",
            },
        });

        return { order_id, total: grandTotal };
    });

    await transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
        to: email,
        subject: `Order Confirmed #${result.order_id} — Bourbon & Whisky`,
        html: generateOrderConfirmationEmail({
            order_id: result.order_id,
            firstname, lastname, email,
            date_added: now,
            products, totals: builtTotals,
            shipping_firstname, shipping_lastname,
            shipping_address_1, shipping_address_2,
            shipping_city, shipping_zone,
            shipping_postcode, shipping_country,
            shipping_method,
            payment_method, payment_firstname,
            payment_lastname, payment_address_1,
            payment_city, payment_zone,
            payment_country,
            comment,
        }),
    });

    return result;
};

// ─────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS
// Mirrors: addOrderHistory() in order.php
// Stock subtract/restock bhi handle karta hai
// ─────────────────────────────────────────────────────────────
// const updateOrderStatus = async (
//   order_id,
//   newStatusId,
//   comment = "",
//   notify = false
// ) => {
//   const ACTIVE_STATUSES = [
//     ORDER_STATUS.PROCESSING,
//     ORDER_STATUS.PROCESSED,
//     ORDER_STATUS.DELIVERED,
//     ORDER_STATUS.LOCAL_DELIVERY,
//   ];

//   const statusNameMap = {
//     [ORDER_STATUS.PENDING]: "Pending",
//     [ORDER_STATUS.PROCESSING]: "Processing",
//     [ORDER_STATUS.SHIPPED]: "Shipped",
//     [ORDER_STATUS.DELIVERED]: "Delivered",
//     [ORDER_STATUS.CANCELED]: "Canceled",
//     [ORDER_STATUS.PROCESSED]: "Processed",
//     [ORDER_STATUS.LOCAL_DELIVERY]: "Locally Delivered by our Driver",
//     [ORDER_STATUS.SCHEDULED_LATER]: "Scheduled for later",
//   };

//   const now = new Date();

//   await prisma.$transaction(async (tx) => {
//     const currentOrder = await tx.uvki_order.findUnique({
//       where: { order_id },
//     });

//     if (!currentOrder) throw new Error(`Order ${order_id} not found`);

//     const wasActive = ACTIVE_STATUSES.includes(currentOrder.order_status_id);
//     const willBeActive = ACTIVE_STATUSES.includes(newStatusId);

//     // ── PHP: Stock subtract — jab pehli baar processing/complete bane ──
//     if (!wasActive && willBeActive) {
//       const orderProducts = await tx.uvki_order_product.findMany({
//         where: { order_id },
//       });

//       for (const op of orderProducts) {
//         await tx.uvki_product.updateMany({
//           where: { product_id: op.product_id, subtract: true },
//           data: { quantity: { decrement: op.quantity } },
//         });

//         const options = await tx.uvki_order_option.findMany({
//           where: { order_id, order_product_id: op.order_product_id },
//         });

//         for (const opt of options) {
//           if (opt.product_option_value_id) {
//             await tx.uvki_product_option_value.updateMany({
//               where: {
//                 product_option_value_id: opt.product_option_value_id,
//                 subtract: true,
//               },
//               data: { quantity: { decrement: op.quantity } },
//             });
//           }
//         }
//       }
//     }

//     // ── PHP: Restock — agar active tha aur cancel/pending ho raha hai ──
//     if (wasActive && !willBeActive) {
//       const orderProducts = await tx.uvki_order_product.findMany({
//         where: { order_id },
//       });

//       for (const op of orderProducts) {
//         await tx.uvki_product.updateMany({
//           where: { product_id: op.product_id, subtract: true },
//           data: { quantity: { increment: op.quantity } },
//         });
//       }
//     }

//     // ── uvki_order update ──
//     await tx.uvki_order.update({
//       where: { order_id },
//       data: { order_status_id: newStatusId, date_modified: now },
//     });

//     // ── uvki_order_history log ──
//     await tx.uvki_order_history.create({
//       data: {
//         order_id,
//         order_status_id: newStatusId,
//         notify,
//         comment,
//         date_added: now,
//       },
//     });

//     // ── ks_uvki_order sync ──
//     await tx.ks_uvki_order.update({
//       where: { order_id },
//       data: { order_status_id: newStatusId, status_updated_date: now },
//     });
//   });

//   return {
//     success: true,
//     order_id,
//     new_status: statusNameMap[newStatusId] ?? "Unknown",
//   };
// };

// ─────────────────────────────────────────────────────────────
// GET ORDER BY ID
// Mirrors: getOrder() in order.php
// custom_field → JSON.parse (PHP: json_decode)
// ─────────────────────────────────────────────────────────────
// const getOrderById = async (order_id) => {
//   const order = await prisma.uvki_order.findUnique({
//     where: { order_id },
//     include: {
//       uvki_order_product: true,
//       uvki_order_total: { orderBy: { sort_order: "asc" } },
//       uvki_order_history: { orderBy: { date_added: "desc" } },
//     },
//   });

//   if (!order) throw new Error("Order not found");

//   // PHP: json_decode($order['custom_field'], true)
//   return {
//     ...order,
//     custom_field: JSON.parse(order.custom_field || "{}"),
//     payment_custom_field: JSON.parse(order.payment_custom_field || "{}"),
//     shipping_custom_field: JSON.parse(order.shipping_custom_field || "{}"),
//   };
// };

