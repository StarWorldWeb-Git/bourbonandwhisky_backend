import crypto from 'crypto';
import { prisma } from '../../../lib/prisma.js';
import { generateToken } from '../../utils/generateToken.js';



export const sha1 = (str) => {
    return crypto.createHash('sha1').update(str).digest('hex');
};

export const hashPassword = (password, salt) => {
    const step1 = sha1(password);
    const step2 = sha1(salt + step1);
    const step3 = sha1(salt + step2);   
    return step3;
}

export const generateSalt = (length = 9) => {
    return crypto.randomBytes(16).toString('hex').substring(0, length);
}


export const loginCustomer = async (email, password, ip) => {

    const customer = await prisma.uvki_customer.findFirst({
        where: {
            email: email.toLowerCase().trim(),
        },
        select: {
            customer_id:       true,
            firstname:         true,
            lastname:          true,
            email:             true,
            telephone:         true,
            password:          true,
            salt:              true,
            status:            true,
            customer_group_id: true
        }
    });

    if (!customer) {
        throw new Error('Invalid email or password'); 
    }

    
    if (!customer.status) {
        throw new Error('Your account is disabled. Contact support.');
    }

    const hashedInput = hashPassword(password, customer.salt);
    if (hashedInput !== customer.password) {
        throw new Error('Invalid email or password');
    }

    await prisma.uvki_customer_ip.create({
        data: {
            customer_id: customer.customer_id,
            ip:          ip || '0.0.0.0',
            date_added:  new Date()
        }
    });

    
    const token = generateToken({
        customer_id:       customer.customer_id,
        email:             customer.email,
        customer_group_id: customer.customer_group_id
    });

    return {
        token,
        customer: {
            customer_id: customer.customer_id,
            firstname:   customer.firstname,
            lastname:    customer.lastname,
            email:       customer.email,
            telephone:   customer.telephone
        }
    };
}


export const registerCustomer = async (data, ip) => {
    const { firstname, lastname, email, telephone, password } = data;

   
    const existing = await prisma.uvki_customer.findFirst({
        where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
        throw new Error('Email already registered');
    }

   
    const salt           = generateSalt();
    const hashedPassword = hashPassword(password, salt);

    
    const newCustomer = await prisma.uvki_customer.create({
        data: {
            customer_group_id: 1,
            store_id:          0,
            language_id:       1,
            firstname:         firstname.trim(),
            lastname:          lastname.trim(),
            email:             email.toLowerCase().trim(),
            telephone:         telephone || '',
            fax:               '',
            password:          hashedPassword,
            salt,
            custom_field:      '',
            ip:                ip || '0.0.0.0',
            status:            true,
            safe:              false,
            token:             '',
            code:              '',
            date_added:        new Date()
        }
    });

    const token = generateToken({
        customer_id:       newCustomer.customer_id,
        email:             newCustomer.email,
        customer_group_id: newCustomer.customer_group_id
    });

    return {
        token,
        customer: {
            customer_id: newCustomer.customer_id,
            firstname:   newCustomer.firstname,
            lastname:    newCustomer.lastname,
            email:       newCustomer.email
        }
    };
}


export const getProfile = async (customer_id) => {
    const customer = await prisma.uvki_customer.findUnique({
        where: { customer_id: Number(customer_id) },
        select: {
            customer_id: true,
            firstname:   true,
            lastname:    true,
            email:       true,
            telephone:   true,
            date_added:  true,
            status:      true
        }
    });

    if (!customer) throw new Error('Customer not found');
    return customer;
}

