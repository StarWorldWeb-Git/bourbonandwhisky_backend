import { prisma } from "../../../lib/prisma.js";
import { parsePositiveInt } from "../../utils/parsePostiveInt.js";


const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;



export const orderhistoryservice = async (data) => {
    const page = parsePositiveInt(data.query?.page, 1);
    const requestedLimit = parsePositiveInt(data.query?.limit, DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;
    const currentCustomer = data.customer;
    const where = { customer_id: currentCustomer.customer_id };

    const [customerOrderHistory, total] = await Promise.all([
        prisma.uvki_order.findMany({
            where,
            skip,
            take: limit,
            orderBy: { date_added: 'desc' }, 
            select: {
                order_id: true,
                firstname: true,
                lastname: true,
                total: true,
                date_added: true,
                uvki_order_history: {
                    select: { order_status_id: true },
                    orderBy: { date_added: 'desc' },
                    take: 1
                },
                uvki_order_tracking: {
                    select: {
                        tracking_number: true,
                        shipingcompany: true
                    }
                },
                _count: {
                    select: { uvki_order_product: true }
                }
            }
        }),
        prisma.uvki_order.count({ where })
    ]);

    const statusIds = customerOrderHistory
        .map(o => o.uvki_order_history[0]?.order_status_id)
        .filter(Boolean);

    const statuses = await prisma.uvki_order_status.findMany({
        where: { order_status_id: { in: statusIds }, language_id: 1 },
        select: { order_status_id: true, name: true }
    });

    const statusMap = Object.fromEntries(statuses.map(s => [s.order_status_id, s.name]));

    const COH = customerOrderHistory.map(order => ({
        order_id: order.order_id,
        firstname: order.firstname,
        lastname: order.lastname,
        total: order.total,
        date_added: order.date_added,
        status: statusMap[order.uvki_order_history[0]?.order_status_id] || 'Unknown',
        tracking: order.uvki_order_tracking,
        total_products: order._count.uvki_order_product
    }));

    return {
        page,
        limit,
        total,                          
        total_pages: Math.ceil(total / limit), 
        data: COH
    };
};


export const CustomerOrderDetailsByOrderIdServices = async (orderid) => {

    const [order, productDetails] = await Promise.all([
        prisma.uvki_order.findFirst({
            where: { order_id: Number(orderid) },
            select: {
                order_id: true,
                payment_method: true,
                shipping_method: true,
                date_added: true,

                payment_firstname: true,
                payment_lastname: true,
                payment_address_1: true,
                payment_address_2: true,
                payment_city: true,
                payment_zone: true,
                payment_country_id: true,
                payment_postcode: true,
                payment_country: true,

                shipping_firstname: true,
                shipping_lastname: true,
                shipping_address_1: true,
                shipping_address_2: true,
                shipping_city: true,
                shipping_zone: true,
                shipping_country_id: true,
                shipping_postcode: true,
                shipping_country: true,

                uvki_order_total: {
                    select: { code: true, title: true, value: true },
                    orderBy: { sort_order: 'asc' }
                },

                
                uvki_order_history: {
                    select: {
                        order_status_id: true,
                        date_added: true,
                        comment: true,
                    },
                    orderBy: { date_added: 'asc' }
                }
            }
        }),

        prisma.uvki_order_product.findMany({
            where: { order_id: Number(orderid) },
            select: {
                name: true,
                model: true,
                quantity: true,
                price: true,
                total: true,
            }
        })
    ]);

    if (!order) throw new Error('Order not found');

    
    const statusIds = [...new Set(
        order.uvki_order_history.map(h => h.order_status_id)
    )];

   
    const statuses = await prisma.uvki_order_status.findMany({
        where: { order_status_id: { in: statusIds }, language_id: 1 },
        select: { order_status_id: true, name: true },
    });

    const statusMap = Object.fromEntries(statuses.map(s => [s.order_status_id, s.name]));

    return {
        order_details: {
            order_id: order.order_id,
            payment_method: order.payment_method,
            shipping_method: order.shipping_method,
            date_added: order.date_added,
        },
        payment_address: {
            firstname: order.payment_firstname,
            lastname: order.payment_lastname,
            address_1: order.payment_address_1,
            address_2: order.payment_address_2,
            city: order.payment_city,
            zone: order.payment_zone,
            postcode: order.payment_postcode,
            country: order.payment_country,
        },
        shipping_address: {
            firstname: order.shipping_firstname,
            lastname: order.shipping_lastname,
            address_1: order.shipping_address_1,
            address_2: order.shipping_address_2,
            city: order.shipping_city,
            zone: order.shipping_zone,
            postcode: order.shipping_postcode,
            country: order.shipping_country,
        },
        products: productDetails,
        totals: order.uvki_order_total,

        
        order_history: order.uvki_order_history.map(h => ({
            status: statusMap[h.order_status_id] || 'Unknown',
            comment: h.comment,
            date_added: h.date_added,
        }))
    };
};