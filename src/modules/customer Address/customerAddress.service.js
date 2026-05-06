import { prisma } from "../../../lib/prisma";


export const getAddressesByCustomer = async (customerId) => {
    const addresses = await prisma.address.findMany({
        where: { customer_id: parseInt(customerId) },
        include: {
            country: {
                select: { country_id: true, name: true, iso_code_2: true },
            },
            zone: {
                select: { zone_id: true, name: true, code: true },
            },
        },
        orderBy: { address_id: 'asc' },
    });
    return addresses;
};

export const getAddressById = async (addressId, customerId) => {
    const address = await prisma.address.findFirst({
        where: {
            address_id: parseInt(addressId),
            customer_id: parseInt(customerId),
        },
        include: {
            country: {
                select: { country_id: true, name: true, iso_code_2: true },
            },
            zone: {
                select: { zone_id: true, name: true, code: true },
            },
        },
    });

    if (!address) {
        const err = new Error('Address not found');
        err.statusCode = 404;
        throw err;
    }

    return address;
};

export const createAddressServices = async (customerId, data) => {
    const customer = await prisma.customer.findUnique({
        where: { customer_id: parseInt(customerId) },
    });
    if (!customer) {
        const err = new Error('Customer not found');
        err.statusCode = 404;
        throw err;
    }

    const country = await prisma.country.findUnique({
        where: { country_id: parseInt(data.country_id) },
    });
    if (!country) {
        const err = new Error('Country not found');
        err.statusCode = 400;
        throw err;
    }

    const zone = await prisma.zone.findFirst({
        where: {
            zone_id: parseInt(data.zone_id),
            country_id: parseInt(data.country_id),
        },
    });
    if (!zone) {
        const err = new Error('Zone does not belong to the selected country');
        err.statusCode = 400;
        throw err;
    }

    const address = await prisma.address.create({
        data: {
            customer_id: parseInt(customerId),
            firstname: data.firstname,
            lastname: data.lastname,
            company: data.company || '',
            address_1: data.address_1,
            address_2: data.address_2 || '',
            city: data.city,
            postcode: data.postcode,
            country_id: parseInt(data.country_id),
            zone_id: parseInt(data.zone_id),
            custom_field: data.custom_field || '',
        },
        include: {
            country: { select: { country_id: true, name: true, iso_code_2: true } },
            zone: { select: { zone_id: true, name: true, code: true } },
        },
    });

    return address;
};


export const updateAddress = async (addressId, customerId, data) => {
    const existing = await prisma.address.findFirst({
        where: {
            address_id: parseInt(addressId),
            customer_id: parseInt(customerId),
        },
    });
    if (!existing) {
        const err = new Error('Address not found');
        err.statusCode = 404;
        throw err;
    }

    if (data.country_id && data.zone_id) {
        const zone = await prisma.zone.findFirst({
            where: {
                zone_id: parseInt(data.zone_id),
                country_id: parseInt(data.country_id),
            },
        });
        if (!zone) {
            const err = new Error('Zone does not belong to the selected country');
            err.statusCode = 400;
            throw err;
        }
    }

    const updateData = {};
    const fields = ['firstname', 'lastname', 'company', 'address_1', 'address_2', 'city', 'postcode', 'custom_field'];
    fields.forEach((f) => { if (data[f] !== undefined) updateData[f] = data[f]; });
    if (data.country_id) updateData.country_id = parseInt(data.country_id);
    if (data.zone_id) updateData.zone_id = parseInt(data.zone_id);

    const updated = await prisma.address.update({
        where: { address_id: parseInt(addressId) },
        data: updateData,
        include: {
            country: { select: { country_id: true, name: true, iso_code_2: true } },
            zone: { select: { zone_id: true, name: true, code: true } },
        },
    });

    return updated;
};

export const deleteAddress = async (addressId, customerId) => {
    const existing = await prisma.address.findFirst({
        where: {
            address_id: parseInt(addressId),
            customer_id: parseInt(customerId),
        },
    });
    if (!existing) {
        const err = new Error('Address not found');
        err.statusCode = 404;
        throw err;
    }

    await prisma.address.delete({
        where: { address_id: parseInt(addressId) },
    });

    return { deleted: true };
};

export const setDefaultAddress = async (customerId, addressId) => {

    const address = await prisma.address.findFirst({
        where: {
            address_id: parseInt(addressId),
            customer_id: parseInt(customerId),
        },
    });
    if (!address) {
        const err = new Error('Address not found');
        err.statusCode = 404;
        throw err;
    }

    await prisma.customer.update({
        where: { customer_id: parseInt(customerId) },
        data: { address_id: parseInt(addressId) },
    });

    return { default_address_id: parseInt(addressId) };
};

// export const getCounter = async () => {

  

// }