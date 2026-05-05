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


export const socialLoginCustomer = async (data, ip) => {
  const { firstname, lastname, email, oauth_provider, oauth_id } = data;
  console.log(data)
  let customer = await prisma.uvki_customer.findFirst({
    where: { email: email.toLowerCase().trim() }
  });

  if (!customer) {
    // Create new customer if not exists
    customer = await prisma.uvki_customer.create({
      data: {
        customer_group_id: 1,
        store_id: 0,
        language_id: 1,
        firstname: firstname ? firstname.trim() : 'User',
        lastname: lastname ? lastname.trim() : '',
        email: email.toLowerCase().trim(),
        telephone: '',
        fax: '',
        password: null, // No password for social login
        salt: null,
        custom_field: '',
        ip: ip || '0.0.0.0',
        newsletter: false,
        status: true,
        safe: false,
        token: '',
        code: '',
        date_added: new Date(),
        oauth_provider,
        oauth_id
      }
    });
  } else {
    // Update existing customer with oauth info if not present
    if (!customer.oauth_provider) {
      customer = await prisma.uvki_customer.update({
        where: { customer_id: customer.customer_id },
        data: {
          oauth_provider,
          oauth_id
        }
      });
    }
  }

  if (!customer.status) {
    throw new Error('Your account is disabled. Contact support.');
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

export const changePasswordService = async (customer_id, { new_password }) => {
  const customer = await prisma.uvki_customer.findUnique({
    where: { customer_id: Number(customer_id) },
    select: { password: true, salt: true }
  });

  if (!customer) {
    throw new Error('Customer not found');
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

  if (!customer) throw new Error('No account found with this email');
  if (!customer.status) throw new Error('Your account is disabled. Contact support.');

  const resetCode = crypto.randomBytes(16).toString('hex');

  await prisma.uvki_customer.update({
    where: { customer_id: customer.customer_id },
    data: { code: resetCode }
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset?code=${resetCode}`;

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
    to: customer.email,
    subject: 'Reset Your Password - Bourbon and Whisky',
    html: `
            <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #8B6914 100%); padding: 40px 20px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; letter-spacing:2px; text-transform:uppercase;">
                🥃 Bourbon & Whisky 🥃
              </h1>
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px; letter-spacing:1px;">
                Premium Spirits Collection
              </p>
            </td>
          </tr>

          <!-- Lock Icon Banner -->
          <tr>
            <td style="background:#fdf8ee; padding: 30px 20px 10px; text-align:center;">
              <div style="width:70px; height:70px; background: linear-gradient(135deg, #8B6914, #C9A84C); border-radius:50%; margin:0 auto; display:flex; align-items:center; justify-content:center; font-size:32px; line-height:70px;">
                🔐
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fdf8ee; padding: 20px 50px 40px;">

              <h2 style="color:#2d2d2d; font-size:24px; text-align:center; margin:0 0 10px;">
                Password Reset Request
              </h2>
              <p style="color:#888; font-size:14px; text-align:center; margin:0 0 30px;">
                We received a request to reset your password
              </p>

              <!-- Divider -->
              <div style="height:1px; background: linear-gradient(to right, transparent, #C9A84C, transparent); margin-bottom:30px;"></div>

              <p style="color:#444; font-size:16px; margin:0 0 10px;">
                Hi <strong style="color:#8B6914;">${customer.firstname}</strong> 👋
              </p>
              <p style="color:#666; font-size:15px; line-height:1.7; margin:0 0 30px;">
                Someone requested a password reset for your <strong>Bourbon & Whisky</strong> account. 
                Click the button below to set a new password. This link is valid for <strong>1 hour only.</strong>
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${resetLink}"
                       style="display:inline-block;
                              background: linear-gradient(135deg, #8B6914 0%, #C9A84C 100%);
                              color:#ffffff;
                              text-decoration:none;
                              padding: 16px 48px;
                              border-radius:50px;
                              font-size:16px;
                              font-weight:bold;
                              letter-spacing:1px;
                              box-shadow: 0 4px 15px rgba(139,105,20,0.4);">
                      🔑 Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning Box -->
              <div style="background:#fff8e6; border-left:4px solid #C9A84C; border-radius:4px; padding:16px 20px; margin-bottom:20px;">
                <p style="margin:0; color:#8B6914; font-size:14px;">
                  ⚠️ <strong>Didn't request this?</strong> You can safely ignore this email. 
                  Your password will remain unchanged.
                </p>
              </div>

              <!-- Link Copy Box -->
              <p style="color:#999; font-size:13px; margin:0 0 8px;">
                If the button doesn't work, copy this link:
              </p>
              <div style="background:#f0f0f0; border-radius:6px; padding:12px 16px; word-break:break-all;">
                <a href="${resetLink}" style="color:#8B6914; font-size:12px; text-decoration:none;">
                  ${resetLink}
                </a>
              </div>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 50px;">
              <div style="height:1px; background:#eeeeee;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:30px 50px; text-align:center;">
              <p style="color:#aaa; font-size:13px; margin:0 0 8px;">
                © 2025 Bourbon & Whisky. All rights reserved.
              </p>
              <p style="color:#aaa; font-size:12px; margin:0;">
                This is an automated email, please do not reply.
              </p>
              <div style="margin-top:16px;">
                <a href="https://bourbonandwhisky.com" style="color:#C9A84C; font-size:13px; text-decoration:none;">
                  🌐 Visit our website
                </a>
              </div>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
        `
  });

  return { message: 'Password reset link sent to your email' };
};

export const resetPasswordService = async (code, new_password) => {

  const customer = await prisma.uvki_customer.findFirst({
    where: { code: code },
    select: {
      customer_id: true,
      code: true
    }
  });

  if (!customer || !customer.code) {
    throw new Error('Invalid or expired reset link');
  }
  const newSalt = generateSalt();
  const newHashedPassword = hashPassword(new_password, newSalt);

  await prisma.uvki_customer.update({
    where: { customer_id: customer.customer_id },
    data: {
      password: newHashedPassword,
      salt: newSalt,
      code: ''
    }
  });

  return { message: 'Password reset successfully. Please login.' };
};

export const accountInformationService = async (data) => {
  const { customer_id, ...fields } = data;

  if (!customer_id) throw new Error("customer_id is required");

  const [existing, emailExist] = await Promise.all([
    prisma.uvki_customer.findFirst({ where: { customer_id: Number(customer_id) } }),
    fields.email
      ? prisma.uvki_customer.findFirst({
        where: { email: fields.email.toLowerCase().trim(), NOT: { customer_id } }
      })
      : null
  ]);

  if (!existing) throw new Error("Customer not found");
  if (emailExist) throw new Error("Email already exists in another account");


  const updateData = Object.fromEntries(
    Object.entries(fields)
      .filter(([key, val]) => String(val).trim() !== String(existing[key]).trim())
      .map(([key, val]) => [key, String(val).trim()])
  );

  if (!Object.keys(updateData).length) return { message: "No changes detected" };

  return await prisma.uvki_customer.update({
    where: { customer_id: Number(customer_id) },
    data: updateData,
  });
};