import crypto from 'crypto';
import { prisma } from '../../../lib/prisma.js';
import { generateToken } from '../../utils/generateToken.js';
import { transporter } from '../../config/nodemiller.js';



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


export const loginCustomer = async (data, ip) => {
    const { email, password } = data;

    const customer = await prisma.uvki_customer.findFirst({
        where: {
            email: email.toLowerCase().trim(),
        },
        select: {
            customer_id: true,
            firstname: true,
            lastname: true,
            email: true,
            telephone: true,
            password: true,
            salt: true,
            status: true,
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
            ip: ip || '0.0.0.0',
            date_added: new Date()
        }
    });


    const token = generateToken({
        customer_id: customer.customer_id,
        email: customer.email,
        customer_group_id: customer.customer_group_id
    });

    return {
        token,
        customer: {
            customer_id: customer.customer_id,
            firstname: customer.firstname,
            lastname: customer.lastname,
            email: customer.email,
            telephone: customer.telephone
        }
    };
}


export const registerCustomer = async (data, ip) => {
    const { firstname, lastname, email, telephone, password, newsletter } = data;


    const existing = await prisma.uvki_customer.findFirst({
        where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
        throw new Error('Email already registered');
    }


    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);


    const newCustomer = await prisma.uvki_customer.create({
        data: {
            customer_group_id: 1,
            store_id: 0,
            language_id: 1,
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: email.toLowerCase().trim(),
            telephone: telephone || '',
            fax: '',
            password: hashedPassword,
            salt,
            custom_field: '',
            ip: ip || '0.0.0.0',
            newsletter: Boolean(newsletter),
            status: true,
            safe: false,
            token: '',
            code: '',
            date_added: new Date()
        }
    });

    const token = generateToken({
        customer_id: newCustomer.customer_id,
        email: newCustomer.email,
        customer_group_id: newCustomer.customer_group_id
    });

    return {
        token,
        customer: {
            customer_id: newCustomer.customer_id,
            firstname: newCustomer.firstname,
            lastname: newCustomer.lastname,
            email: newCustomer.email
        }
    };
}


export const getProfile = async (customer_id) => {
    const customer = await prisma.uvki_customer.findUnique({
        where: { customer_id: Number(customer_id) },
        select: {
            customer_id: true,
            firstname: true,
            lastname: true,
            email: true,
            telephone: true,
            date_added: true,
            status: true
        }
    });

    if (!customer) throw new Error('Customer not found');
    return customer;
}

export const changePasswordService = async (customer_id, { old_password, new_password }) => {
    const customer = await prisma.uvki_customer.findUnique({
        where: { customer_id: Number(customer_id) },
        select: { password: true, salt: true }
    });

    if (!customer) {
        throw new Error('Customer not found');
    }

    const hashedOldPassword = hashPassword(old_password, customer.salt);
    if (hashedOldPassword !== customer.password) {
        throw new Error('Current password is incorrect');
    }

    const salt = generateSalt();
    const hashedNewPassword = hashPassword(new_password, salt);

    await prisma.uvki_customer.update({
        where: { customer_id: Number(customer_id) },
        data: { password: hashedNewPassword, salt }
    });

    return { message: 'Password changed successfully' };
}



export const forgotPasswordRequestService = async (email) => {


    const customer = await prisma.uvki_customer.findFirst({
        where: { email: email.toLowerCase().trim() },
        select: {
            customer_id: true,
            firstname: true,
            email: true,
            status: true
        }
    });

    // 2. Customer nahi mila → error
    if (!customer) throw new Error('No account found with this email');

    // 3. Account disabled hai?
    if (!customer.status) throw new Error('Your account is disabled. Contact support.');

    // 4. Unique reset code generate karo (32 char hex)
    const resetCode = crypto.randomBytes(16).toString('hex');
    // Example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"

    // 5. DB ke "code" column mein save karo
    // OpenCart bhi yahi "code" column use karta hai - compatible rahega
    await prisma.uvki_customer.update({
        where: { customer_id: customer.customer_id },
        data: { code: resetCode }
    });

    // 6. Reset link banao
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?code=${resetCode}`;

    // 7. Email bhejo
    await transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
        to: customer.email,
        subject: 'Reset Your Password - Bourbon and Whisky',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8B6914;">Password Reset Request</h2>
                <p>Hi ${customer.firstname},</p>
                <p>We received a request to reset your password.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetLink}" 
                   style="background:#8B6914; color:white; padding:12px 24px; 
                          text-decoration:none; border-radius:4px; display:inline-block;">
                   Reset Password
                </a>
                <p style="margin-top:20px; color:#666;">
                    If you didn't request this, please ignore this email.
                </p>
                <p style="color:#666;">This link will expire in 1 hour.</p>
            </div>
        `
    });

    return { message: 'Password reset link sent to your email' };
};


// ─── STEP 2: Reset Password ───
// User link click karta hai → code + new password bhejta hai
export const resetPasswordService = async (code, new_password) => {

    // 1. Code se customer dhundo
    const customer = await prisma.uvki_customer.findFirst({
        where: { code: code },
        select: {
            customer_id: true,
            code: true
        }
    });

    // 2. Code invalid ya already use ho chuka?
    if (!customer || !customer.code) {
        throw new Error('Invalid or expired reset link');
    }

    // 3. Naya salt aur password banao
    // Same hashPassword function use kar rahe hain jo login mein use hota hai
    // Isliye old aur new dono customers ka password sahi format mein rahega
    const newSalt = generateSalt();
    const newHashedPassword = hashPassword(new_password, newSalt);

    // 4. Password update karo aur code clear karo
    await prisma.uvki_customer.update({
        where: { customer_id: customer.customer_id },
        data: {
            password: newHashedPassword,
            salt: newSalt,
            code: '' // ← code clear karo taaki dobara use na ho sake
        }
    });

    return { message: 'Password reset successfully. Please login.' };
};