/**
 * Order Confirmation Email Template
 * Bourbon & Whisky — Light Mode Premium Email Design
 *
 * Usage: generateOrderConfirmationEmail(orderData)
 */

export const generateOrderConfirmationEmail = ({
  order_id,
  firstname,
  lastname,
  email,
  date_added,
  products = [],
  shipping_firstname,
  shipping_lastname,
  shipping_address_1,
  shipping_address_2,
  shipping_city,
  shipping_zone,
  shipping_postcode,
  shipping_country,
  shipping_method,
  payment_method,
  payment_firstname,
  payment_lastname,
  payment_address_1,
  payment_city,
  payment_zone,
  payment_country,
  totals = [],
  comment = "",
}) => {
  const subTotal   = totals.find((t) => t.code === "sub_total")?.value ?? 0;
  const shipping   = totals.find((t) => t.code === "shipping")?.value  ?? 0;
  const tip        = totals.find((t) => t.code === "tip")?.value       ?? 0;
  const tax        = totals.find((t) => t.code === "tax")?.value       ?? 0;
  const grandTotal = totals.find((t) => t.code === "total")?.value     ?? 0;

  const fmt = (n) => `$${Number(n).toFixed(2)}`;
  const orderDate = new Date(date_added).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const productRows = products.map((p) => {
    const optionsHtml = (p.option || p.options || []).map(opt => `
      <div style="margin-top:4px; padding:4px 8px; background:#fdfbf7; border-left:2px solid #c99000; font-size:11px; color:#7a6a50;">
        <strong style="text-transform:uppercase; font-size:10px;">${opt.name}:</strong> 
        <em style="color:#4a3f2f;">"${opt.value}"</em>
      </div>
    `).join("");

    return `
    <tr>
      <td style="padding:14px 16px; border-bottom:1px solid #e8e0d0; font-family:'Georgia',serif; font-size:13px; color:#4a3f2f; line-height:1.5; background:#ffffff;">
        <span style="display:block; font-weight:700; color:#2c1f0e; font-size:14px;">${p.name}</span>
        <span style="color:#9a8060; font-size:11px; letter-spacing:0.5px;">Model: ${p.model}</span>
        ${optionsHtml}
      </td>
      <td style="padding:14px 16px; border-bottom:1px solid #e8e0d0; text-align:center; font-family:'Georgia',serif; font-size:13px; color:#4a3f2f; background:#ffffff;">
        ${p.quantity}
      </td>
      <td style="padding:14px 16px; border-bottom:1px solid #e8e0d0; text-align:right; font-family:'Georgia',serif; font-size:13px; color:#4a3f2f; background:#ffffff;">
        ${fmt(p.price)}
      </td>
      <td style="padding:14px 16px; border-bottom:1px solid #e8e0d0; text-align:right; font-family:'Georgia',serif; font-size:13px; color:#c99000; font-weight:700; background:#ffffff;">
        ${fmt(p.total ?? p.price * p.quantity)}
      </td>
    </tr>
  `}).join("");

  const tipRow = tip > 0 ? `
    <tr bgcolor="#fdfbf7">
      <td colspan="3" style="padding:9px 16px; text-align:right; font-family:'Georgia',serif; font-size:12px; color:#7a6a50; border-top:1px solid #e8e0d0; background:#fdfbf7 !important;">
        Team Support Tip
      </td>
      <td style="padding:9px 16px; text-align:right; font-family:'Georgia',serif; font-size:12px; color:#4a3f2f; border-top:1px solid #e8e0d0; background:#fdfbf7 !important;">
        ${fmt(tip)}
      </td>
    </tr>
  ` : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed — Bourbon &amp; Whisky</title>
  <style>
    body, .email-body { background-color:#f2ede6 !important; }
    u + .email-body   { background-color:#f2ede6 !important; }
    u + .email-body .email-wrapper { background-color:#f2ede6 !important; }
    [data-ogsc] body  { background-color:#f2ede6 !important; }
    div[style*="margin: 16px 0"] { margin:0 !important; }
  </style>
</head>
<body class="email-body" style="margin:0; padding:0; background-color:#f2ede6 !important; font-family:'Georgia',serif;">

  <!-- ══ OUTER WRAPPER ══ -->
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f2ede6"
    style="background-color:#f2ede6 !important; padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px; width:100%;">

          <!-- ══ HEADER ══ -->
          <tr>
            <td bgcolor="#2c1f0e"
              style="background:#2c1f0e !important;
                     border-radius:12px 12px 0 0;
                     padding:44px 40px 36px;
                     text-align:center;
                     border:1px solid #c99000;
                     border-bottom:none;">

              <!-- Gold shimmer line -->
              <div style="width:70px; height:2px; background:linear-gradient(90deg,transparent,#c99000,transparent); margin:0 auto 28px;"></div>

              <!-- Brand -->
              <h1 style="margin:0 0 4px; font-family:'Georgia',serif; font-size:30px; font-weight:400;
                          letter-spacing:7px; color:#c99000; text-transform:uppercase;">
                Bourbon &amp; Whisky
              </h1>
              <p style="margin:0 0 32px; font-size:10px; letter-spacing:4px; color:#a07840; text-transform:uppercase;">
                Est. Premium Spirits
              </p>

              <!-- Confirmed Badge -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td bgcolor="#c99000"
                    style="background:#c99000 !important; border-radius:30px; padding:11px 30px;">
                    <span style="font-size:11px; font-weight:700; letter-spacing:3px; color:#2c1f0e; text-transform:uppercase;">
                      ✦ Order Confirmed ✦
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin:22px 0 0; font-size:14px; color:#c8b08a; letter-spacing:0.3px;">
                Thank you, <strong style="color:#f5e6c0;">${firstname} ${lastname}</strong>. Your order has been received.
              </p>

              <!-- Divider -->
              <div style="width:100%; height:1px;
                background:linear-gradient(90deg,transparent,#c99000 30%,#c99000 70%,transparent);
                margin-top:32px;"></div>
            </td>
          </tr>

          <!-- ══ ORDER META BAR ══ -->
          <tr>
            <td bgcolor="#fffdf7"
              style="background:#fffdf7 !important;
                     border-left:1px solid #c99000;
                     border-right:1px solid #c99000;
                     padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="#fffdf7"
                    style="padding:18px 20px; border-right:1px solid #e8e0d0; text-align:center; width:33%; background:#fffdf7 !important;">
                    <span style="display:block; font-size:9px; letter-spacing:2.5px; color:#a07840; text-transform:uppercase; margin-bottom:6px;">Order ID</span>
                    <span style="font-size:16px; font-weight:700; color:#c99000; letter-spacing:1px;">#${order_id}</span>
                  </td>
                  <td bgcolor="#fffdf7"
                    style="padding:18px 20px; border-right:1px solid #e8e0d0; text-align:center; width:33%; background:#fffdf7 !important;">
                    <span style="display:block; font-size:9px; letter-spacing:2.5px; color:#a07840; text-transform:uppercase; margin-bottom:6px;">Date</span>
                    <span style="font-size:12px; color:#4a3f2f;">${orderDate}</span>
                  </td>
                  <td bgcolor="#fffdf7"
                    style="padding:18px 20px; text-align:center; width:33%; background:#fffdf7 !important;">
                    <span style="display:block; font-size:9px; letter-spacing:2.5px; color:#a07840; text-transform:uppercase; margin-bottom:6px;">Status</span>
                    <span style="font-size:11px; color:#2e7d32; font-weight:700; letter-spacing:1px;">● Pending</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ PRODUCTS TABLE ══ -->
          <tr>
            <td bgcolor="#ffffff"
              style="background:#ffffff !important;
                     border-left:1px solid #c99000;
                     border-right:1px solid #c99000;
                     padding:0 24px 24px;">

              <!-- Section label -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:22px 0 12px; border-bottom:2px solid #c99000;">
                    <span style="font-size:9px; letter-spacing:3px; color:#c99000; text-transform:uppercase; font-weight:700;">
                      ✦ Order Items
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Product rows -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1px solid #e8e0d0; border-top:none; overflow:hidden; margin-top:0;">
                <thead>
                  <tr bgcolor="#f7f2ea">
                    <th style="padding:11px 16px; text-align:left; font-size:9px; letter-spacing:2px; color:#a07840; text-transform:uppercase; font-weight:700; border-bottom:1px solid #e8e0d0; background:#f7f2ea !important;">Product</th>
                    <th style="padding:11px 16px; text-align:center; font-size:9px; letter-spacing:2px; color:#a07840; text-transform:uppercase; font-weight:700; border-bottom:1px solid #e8e0d0; width:60px; background:#f7f2ea !important;">Qty</th>
                    <th style="padding:11px 16px; text-align:right; font-size:9px; letter-spacing:2px; color:#a07840; text-transform:uppercase; font-weight:700; border-bottom:1px solid #e8e0d0; width:90px; background:#f7f2ea !important;">Unit Price</th>
                    <th style="padding:11px 16px; text-align:right; font-size:9px; letter-spacing:2px; color:#a07840; text-transform:uppercase; font-weight:700; border-bottom:1px solid #e8e0d0; width:90px; background:#f7f2ea !important;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1px solid #e8e0d0; border-top:none; border-radius:0 0 8px 8px; overflow:hidden;">
                <tr bgcolor="#fdfbf7">
                  <td colspan="3" style="padding:9px 16px; text-align:right; font-family:'Georgia',serif; font-size:12px; color:#7a6a50; border-top:1px solid #e8e0d0; background:#fdfbf7 !important;">Sub-Total</td>
                  <td style="padding:9px 16px; text-align:right; font-family:'Georgia',serif; font-size:12px; color:#4a3f2f; width:90px; background:#fdfbf7 !important;">${fmt(subTotal)}</td>
                </tr>
                <tr bgcolor="#f7f2ea">
                  <td colspan="3" style="padding:9px 16px; text-align:right; font-family:'Georgia',serif; font-size:12px; color:#7a6a50; border-top:1px solid #e8e0d0; background:#f7f2ea !important;">Per Item Shipping Rate</td>
                  <td style="padding:9px 16px; text-align:right; font-family:'Georgia',serif; font-size:12px; color:#4a3f2f; border-top:1px solid #e8e0d0; background:#f7f2ea !important;">${fmt(shipping)}</td>
                </tr>
                ${tipRow}
                <tr bgcolor="#fdfbf7">
                  <td colspan="3" style="padding:9px 16px; text-align:right; font-family:'Georgia',serif; font-size:12px; color:#7a6a50; border-top:1px solid #e8e0d0; background:#fdfbf7 !important;">Tax (10.25%)</td>
                  <td style="padding:9px 16px; text-align:right; font-family:'Georgia',serif; font-size:12px; color:#4a3f2f; border-top:1px solid #e8e0d0; background:#fdfbf7 !important;">${fmt(tax)}</td>
                </tr>
                <!-- Grand Total -->
                <tr bgcolor="#c99000">
                  <td colspan="3" style="padding:15px 16px; text-align:right; font-family:'Georgia',serif; font-size:13px; font-weight:700; color:#2c1f0e; letter-spacing:1px; text-transform:uppercase; border-top:2px solid #a07800; background:#c99000 !important;">Grand Total</td>
                  <td style="padding:15px 16px; text-align:right; font-family:'Georgia',serif; font-size:17px; font-weight:700; color:#2c1f0e; border-top:2px solid #a07800; background:#c99000 !important;">${fmt(grandTotal)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ SHIPPING + PAYMENT ══ -->
          <tr>
            <td bgcolor="#f7f2ea"
              style="background:#f7f2ea !important;
                     border-left:1px solid #c99000;
                     border-right:1px solid #c99000;
                     padding:20px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr valign="top">

                  <!-- Shipping -->
                  <td style="width:50%; padding-right:10px;">
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="border:1px solid #ddd5c0; border-radius:8px; overflow:hidden;">
                      <tr>
                        <td bgcolor="#2c1f0e" style="background:#2c1f0e !important; padding:12px 16px; border-bottom:1px solid #c99000;">
                          <span style="font-size:9px; letter-spacing:2.5px; color:#c99000; text-transform:uppercase; font-weight:700;">📦 Shipping Details</span>
                        </td>
                      </tr>
                      <tr>
                        <td bgcolor="#ffffff" style="padding:16px; background:#ffffff !important;">
                          <p style="margin:0 0 8px; font-size:13px; font-weight:700; color:#2c1f0e;">${shipping_firstname} ${shipping_lastname}</p>
                          <p style="margin:0 0 4px; font-size:12px; color:#7a6a50; line-height:1.7;">${shipping_address_1}${shipping_address_2 ? ", " + shipping_address_2 : ""}</p>
                          <p style="margin:0 0 4px; font-size:12px; color:#7a6a50; line-height:1.7;">${shipping_city}, ${shipping_zone} ${shipping_postcode}</p>
                          <p style="margin:0 0 14px; font-size:12px; color:#7a6a50;">${shipping_country}</p>
                          <div style="height:1px; background:#e8e0d0; margin-bottom:12px;"></div>
                          <span style="font-size:9px; letter-spacing:1.5px; color:#a07840; text-transform:uppercase;">Method</span>
                          <p style="margin:4px 0 0; font-size:12px; color:#4a3f2f; font-weight:600;">${shipping_method}</p>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Payment -->
                  <td style="width:50%; padding-left:10px;">
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="border:1px solid #ddd5c0; border-radius:8px; overflow:hidden;">
                      <tr>
                        <td bgcolor="#2c1f0e" style="background:#2c1f0e !important; padding:12px 16px; border-bottom:1px solid #c99000;">
                          <span style="font-size:9px; letter-spacing:2.5px; color:#c99000; text-transform:uppercase; font-weight:700;">💳 Payment Details</span>
                        </td>
                      </tr>
                      <tr>
                        <td bgcolor="#ffffff" style="padding:16px; background:#ffffff !important;">
                          <p style="margin:0 0 8px; font-size:13px; font-weight:700; color:#2c1f0e;">${payment_firstname} ${payment_lastname}</p>
                          <p style="margin:0 0 4px; font-size:12px; color:#7a6a50; line-height:1.7;">${payment_address_1}</p>
                          <p style="margin:0 0 14px; font-size:12px; color:#7a6a50; line-height:1.7;">${payment_city}, ${payment_zone}</p>
                          <div style="height:1px; background:#e8e0d0; margin-bottom:12px;"></div>
                          <span style="font-size:9px; letter-spacing:1.5px; color:#a07840; text-transform:uppercase;">Method</span>
                          <p style="margin:4px 0 10px; font-size:12px; color:#4a3f2f; font-weight:600;">${payment_method}</p>
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td bgcolor="#f0faf0" style="background:#f0faf0 !important; border:1px solid #c8e6c9; border-radius:6px; padding:7px 12px;">
                                <span style="font-size:10px; color:#2e7d32; letter-spacing:1px; font-weight:600;">🔒 Secured Payment</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>

                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ CUSTOMER INFO ══ -->
          <tr>
            <td bgcolor="#ffffff"
              style="background:#ffffff !important;
                     border-left:1px solid #c99000;
                     border-right:1px solid #c99000;
                     padding:0 24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1px solid #ddd5c0; border-radius:8px; overflow:hidden;">
                <tr>
                  <td bgcolor="#2c1f0e" style="background:#2c1f0e !important; padding:12px 16px; border-bottom:1px solid #c99000;">
                    <span style="font-size:9px; letter-spacing:2.5px; color:#c99000; text-transform:uppercase; font-weight:700;">👤 Customer Information</span>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#fffdf7" style="background:#fffdf7 !important;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:14px 18px; border-right:1px solid #e8e0d0; width:50%;">
                          <span style="font-size:9px; letter-spacing:1.5px; color:#a07840; text-transform:uppercase; display:block; margin-bottom:5px;">Full Name</span>
                          <span style="font-size:13px; color:#2c1f0e; font-weight:600;">${firstname} ${lastname}</span>
                        </td>
                        <td style="padding:14px 18px; width:50%;">
                          <span style="font-size:9px; letter-spacing:1.5px; color:#a07840; text-transform:uppercase; display:block; margin-bottom:5px;">Email</span>
                          <span style="font-size:13px; color:#2c1f0e; font-weight:600;">${email}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${comment ? `
          <!-- ══ ORDER COMMENT ══ -->
          <tr>
            <td bgcolor="#ffffff"
              style="background:#ffffff !important;
                     border-left:1px solid #c99000;
                     border-right:1px solid #c99000;
                     padding:0 24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1px solid #ddd5c0; border-radius:8px; overflow:hidden;">
                <tr>
                  <td bgcolor="#2c1f0e" style="background:#2c1f0e !important; padding:12px 16px; border-bottom:1px solid #c99000;">
                    <span style="font-size:9px; letter-spacing:2.5px; color:#c99000; text-transform:uppercase; font-weight:700;">💬 Order Message / Gift Note</span>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#fffdf7" style="padding:18px; background:#fffdf7 !important; font-family:'Georgia',serif; font-size:13px; color:#4a3f2f; line-height:1.6; font-style:italic;">
                    "${comment}"
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- ══ FOOTER ══ -->
          <tr>
            <td bgcolor="#2c1f0e"
              style="background:#2c1f0e !important;
                     border:1px solid #c99000;
                     border-top:none;
                     border-radius:0 0 12px 12px;
                     padding:32px 40px;
                     text-align:center;">

              <div style="width:100%; height:1px;
                background:linear-gradient(90deg,transparent,#c99000 30%,#c99000 70%,transparent);
                margin-bottom:24px;"></div>

              <p style="margin:0 0 8px; font-size:11px; letter-spacing:2px; color:#a07840; text-transform:uppercase;">
                Questions about your order?
              </p>
              <p style="margin:0 0 20px; font-size:13px; color:#c8b08a;">
                Reply to this email or contact us at
                <a href="mailto:support@bourbonandwhisky.com" style="color:#c99000; text-decoration:none; font-weight:600;">
                  support@bourbonandwhisky.com
                </a>
              </p>

              <div style="width:40px; height:1px; background:#a07840; margin:0 auto 16px;"></div>

              <p style="margin:0; font-size:10px; color:#6b5230; letter-spacing:1px;">
                &copy; ${new Date().getFullYear()} Bourbon &amp; Whisky. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
};