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
  const subTotal = totals.find((t) => t.code === "sub_total")?.value ?? 0;
  const shipping = totals.find((t) => t.code === "shipping")?.value ?? 0;
  const tip = totals.find((t) => t.code === "tip")?.value ?? 0;
  const tax = totals.find((t) => t.code === "tax")?.value ?? 0;
  const grandTotal = totals.find((t) => t.code === "total")?.value ?? 0;

  const fmt = (n) => `$${Number(n).toFixed(2)}`;
  const orderDate = new Date(date_added).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  // src="https://www.bourbonandwhisky.com/image/catalog/bw-and-dc_logo.png"

  /* ── Logo (hosted image) ─────────────────────────────────── */
  const logoSvg = `
    <img
      src="https://www.bourbonandwhisky.com/image/catalog/bw-fav.png"
      alt="Bourbon &amp; Whisky"
      width="100"
      style="display:block;margin:0 auto;max-width:180px;height:auto;border:0;outline:none;text-decoration:none;"
    />
  `;

  /* ── Product rows ──────────────────────────────────────── */
  const productRows = products.map((p) => {
    const optionsHtml = (p?.option || p?.options || []).map(opt => `
      <div style="margin-top:5px; padding:4px 10px; background:#fdf8ee; border-left:2px solid #c99000; font-size:11px; color:#7a6a50; line-height:1.5;">
        <strong style="text-transform:uppercase; font-size:10px; letter-spacing:0.5px; color:#a07840;">${opt.name}:</strong>&nbsp;
        <span style="color:#4a3f2f; font-style:italic;">${opt.value}</span>
      </div>
    `).join("");

    return `
    <tr>
      <td style="padding:16px 18px; border-bottom:1px solid #ede4d0; vertical-align:top;">
        <span style="display:block; font-family:'Georgia',serif; font-weight:700; font-size:14px; color:#1e1208; line-height:1.4;">${p.name}</span>
        <span style="display:block; font-family:Arial,sans-serif; font-size:11px; color:#b09060; margin-top:3px; letter-spacing:0.3px;">Model: ${p.model}</span>
        ${optionsHtml}
      </td>
      <td style="padding:16px 18px; border-bottom:1px solid #ede4d0; text-align:center; vertical-align:top; font-family:'Georgia',serif; font-size:14px; color:#4a3f2f; white-space:nowrap;">${p.quantity}</td>
      <td style="padding:16px 18px; border-bottom:1px solid #ede4d0; text-align:right; vertical-align:top; font-family:'Georgia',serif; font-size:14px; color:#4a3f2f; white-space:nowrap;">${fmt(p.price)}</td>
      <td style="padding:16px 10px; border-bottom:1px solid #ede4d0; text-align:right; vertical-align:top; font-family:'Georgia',serif; font-size:14px; font-weight:700; color:#c99000; white-space:nowrap;">${fmt(p.total ?? p.price * p.quantity)}</td>
    </tr>
    `;
  }).join("");

  const tipRow = tip > 0 ? `
    <tr>
      <td colspan="3" style="padding:10px 18px; text-align:right; font-family:Arial,sans-serif; font-size:12px; color:#7a6a50; border-top:1px solid #ede4d0; background:#fdf8ee;">Team Support Tip</td>
      <td style="padding:10px 18px; text-align:right; font-family:'Georgia',serif; font-size:12px; color:#4a3f2f; border-top:1px solid #ede4d0; background:#fdf8ee;">${fmt(tip)}</td>
    </tr>
  ` : "";

  /* ── Comment block ──────────────────────────────────────── */
  const commentBlock = comment ? `
  <tr>
    <td style="padding:0 28px 24px; background:#fafaf8;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="border:1px solid #ddd5c0; border-radius:6px; overflow:hidden;">
        <tr>
          <td style="background:#2c1f0e; padding:12px 18px; border-bottom:1px solid #c99000;">
            <span style="font-family:Arial,sans-serif; font-size:9px; letter-spacing:2.5px; color:#c99000; text-transform:uppercase; font-weight:700;">Order Note / Gift Message</span>
          </td>
        </tr>
        <tr>
          <td style="background:#fffdf7; padding:18px 20px; font-family:'Georgia',serif; font-size:13px; color:#4a3f2f; line-height:1.7; font-style:italic;">
            &#8220;${comment}&#8221;
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ` : "";

  /* ── Full email ─────────────────────────────────────────── */
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmed — Bourbon &amp; Whisky</title>
  <style>
    body, .bg { background-color:#f0e8da !important; }
    u + .bg   { background-color:#f0e8da !important; }
    [data-ogsc] body { background-color:#f0e8da !important; }
    div[style*="margin: 16px 0"] { margin:0 !important; }
    @media only screen and (max-width:640px) {
      .col-half { width:100% !important; display:block !important; }
      .col-half + .col-half { margin-top:12px !important; }
    }
  </style>
</head>
<body class="bg" style="margin:0;padding:0;background-color:#f0e8da !important;">

<table class="bg" role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="background:#f0e8da !important; padding:48px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;
               box-shadow:0 4px 32px rgba(44,31,14,0.18);border:1px solid #c99000;">

        <!-- ════ HEADER ════ -->
        <tr>
          <td style="background:#1a1008;padding:0;">
            <!-- Top gold rule -->
            <div style="height:3px;background:linear-gradient(90deg,#6b4100,#c99000,#e8b800,#c99000,#6b4100);"></div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:36px 36px 28px;text-align:center;">

                  <!-- Logo SVG -->
                  <div style="margin:0 auto 28px;">
                    ${logoSvg}
                  </div>

                  <!-- Horizontal rule -->
                  <div style="width:100%;height:1px;background:linear-gradient(90deg,transparent,#c99000 30%,#c99000 70%,transparent);margin-bottom:28px;"></div>

                  <!-- Confirmed badge -->
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                    <tr>
                      <td style="background:#c99000;border-radius:24px;padding:10px 28px;">
                        <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;color:#1a1008;text-transform:uppercase;">&#10022;&nbsp; Order Confirmed &nbsp;&#10022;</span>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-family:'Georgia',serif;font-size:15px;color:#c8b08a;line-height:1.6;">
                    Thank you, <strong style="color:#f5e6c0;">${firstname} ${lastname}</strong>.
                    <br/>Your order has been received and is being processed.
                  </p>
                </td>
              </tr>
            </table>
            <!-- Bottom gold rule -->
            <div style="height:1px;background:linear-gradient(90deg,transparent,#c99000 30%,#c99000 70%,transparent);"></div>
          </td>
        </tr>

        <!-- ════ ORDER META BAR ════ -->
        <tr>
          <td style="background:#24160a;padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:18px 20px;border-right:1px solid #3d2810;text-align:center;width:33.3%;">
                  <span style="display:block;font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#a07840;text-transform:uppercase;margin-bottom:6px;">Order</span>
                  <span style="font-family:'Georgia',serif;font-size:17px;font-weight:700;color:#c99000;letter-spacing:1px;">#${order_id}</span>
                </td>
                <td style="padding:18px 20px;border-right:1px solid #3d2810;text-align:center;width:33.3%;">
                  <span style="display:block;font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#a07840;text-transform:uppercase;margin-bottom:6px;">Date</span>
                  <span style="font-family:'Georgia',serif;font-size:13px;color:#e0c98a;">${orderDate}</span>
                </td>
                <td style="padding:18px 20px;text-align:center;width:33.3%;">
                  <span style="display:block;font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#a07840;text-transform:uppercase;margin-bottom:6px;">Status</span>
                  <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;color:#6fcf97;">&#9679; Pending</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ════ BODY ════ -->
        <tr>
          <td style="background:#fafaf8;padding:0;">

            <!-- ── Customer Info ── -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:28px 28px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                    style="border:1px solid #ddd5c0;border-radius:8px;overflow:hidden;">
                    <tr>
                      <td style="background:#2c1f0e;padding:11px 16px;border-bottom:1px solid #c99000;">
                        <span style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2.5px;color:#c99000;text-transform:uppercase;font-weight:700;">Customer</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#ffffff;padding:0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:14px 18px;border-right:1px solid #ede4d0;width:50%;">
                              <span style="display:block;font-family:Arial,sans-serif;font-size:9px;letter-spacing:1.5px;color:#a07840;text-transform:uppercase;margin-bottom:5px;">Name</span>
                              <span style="font-family:'Georgia',serif;font-size:14px;color:#1e1208;font-weight:700;">${firstname} ${lastname}</span>
                            </td>
                            <td style="padding:14px 18px;width:50%;">
                              <span style="display:block;font-family:Arial,sans-serif;font-size:9px;letter-spacing:1.5px;color:#a07840;text-transform:uppercase;margin-bottom:5px;">Email</span>
                              <span style="font-family:Arial,sans-serif;font-size:13px;color:#1e1208;">${email}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- ── Shipping + Payment ── -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:20px 28px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr valign="top">

                      <!-- Shipping -->
                      <td class="col-half" style="width:50%;padding-right:8px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                          style="border:1px solid #ddd5c0;border-radius:8px;overflow:hidden;height:100%;">
                          <tr>
                            <td style="background:#2c1f0e;padding:11px 16px;border-bottom:1px solid #c99000;">
                              <span style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2.5px;color:#c99000;text-transform:uppercase;font-weight:700;">Shipping Details</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#ffffff;padding:16px 18px;">
                              <p style="margin:0 0 6px;font-family:'Georgia',serif;font-size:14px;font-weight:700;color:#1e1208;">${shipping_firstname} ${shipping_lastname}</p>
                              <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:12px;color:#7a6a50;line-height:1.7;">${shipping_address_1}${shipping_address_2 ? ", " + shipping_address_2 : ""}</p>
                              <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:12px;color:#7a6a50;">${shipping_city}, ${shipping_zone} ${shipping_postcode}</p>
                              <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:12px;color:#7a6a50;">${shipping_country}</p>
                              <div style="height:1px;background:#ede4d0;margin-bottom:10px;"></div>
                              <span style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:1.5px;color:#a07840;text-transform:uppercase;display:block;margin-bottom:4px;">Method</span>
                              <span style="font-family:'Georgia',serif;font-size:13px;color:#1e1208;font-weight:600;">${shipping_method}</span>
                            </td>
                          </tr>
                        </table>
                      </td>

                      <!-- Payment -->
                      <td class="col-half" style="width:50%;padding-left:8px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                          style="border:1px solid #ddd5c0;border-radius:8px;overflow:hidden;height:100%;">
                          <tr>
                            <td style="background:#2c1f0e;padding:11px 16px;border-bottom:1px solid #c99000;">
                              <span style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2.5px;color:#c99000;text-transform:uppercase;font-weight:700;">Payment Details</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#ffffff;padding:16px 18px;">
                              <p style="margin:0 0 6px;font-family:'Georgia',serif;font-size:14px;font-weight:700;color:#1e1208;">${payment_firstname} ${payment_lastname}</p>
                              <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:12px;color:#7a6a50;line-height:1.7;">${payment_address_1}</p>
                              <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:12px;color:#7a6a50;">${payment_city}, ${payment_zone}</p>
                              <div style="height:1px;background:#ede4d0;margin-bottom:10px;"></div>
                              <span style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:1.5px;color:#a07840;text-transform:uppercase;display:block;margin-bottom:4px;">Method</span>
                              <span style="font-family:'Georgia',serif;font-size:13px;color:#1e1208;font-weight:600;">${payment_method}</span>
                            </td>
                          </tr>
                        </table>
                      </td>

                    </tr>
                  </table>
                </td>
              </tr>
            </table>

                <!-- ── Order Items ── -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:28px 28px 0;">

                <!-- Section heading -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
                  <tr>
                    <td style="padding-bottom:14px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-right:10px;vertical-align:middle;">
                            <div style="width:3px;height:18px;background:#c99000;border-radius:2px;"></div>
                          </td>
                          <td style="vertical-align:middle;">
                            <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:9px;letter-spacing:3px;color:#a07840;text-transform:uppercase;font-weight:700;">Order Items</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Product table -->
                <table class="prod-table" role="presentation" width="100%" cellpadding="0" cellspacing="0"
                  style="table-layout:fixed;border:1px solid #e8dfc8;border-radius:10px 10px 0 0;overflow:hidden;box-shadow:0 2px 8px rgba(180,140,60,0.07);">
                  <colgroup>
                    <col style="width:auto;"/>
                    <col class="prod-col-qty"   style="width:38px;"/>
                    <col class="prod-col-unit"  style="width:70px;"/>
                    <col class="prod-col-total" style="width:74px;"/>
                  </colgroup>
                  <thead>
                    <tr style="background:linear-gradient(180deg,#f9f5ec 0%,#f2ead8 100%);">
                      <th style="padding:12px 16px;text-align:left;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2.5px;color:#a07840;text-transform:uppercase;font-weight:700;border-bottom:1px solid #e8dfc8;">Product</th>
                      <th style="padding:12px 10px;text-align:center;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2.5px;color:#a07840;text-transform:uppercase;font-weight:700;border-bottom:1px solid #e8dfc8;">Qty</th>
                      <th style="padding:12px 10px;text-align:right;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2.5px;color:#a07840;text-transform:uppercase;font-weight:700;border-bottom:1px solid #e8dfc8;">Unit</th>
                      <th style="padding:12px 16px 12px 10px;text-align:right;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2.5px;color:#a07840;text-transform:uppercase;font-weight:700;border-bottom:1px solid #e8dfc8;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productRows}
                  </tbody>
                </table>

                <!-- Totals -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                  style="border:1px solid #e8dfc8;border-top:none;border-radius:0 0 10px 10px;overflow:hidden;box-shadow:0 4px 12px rgba(180,140,60,0.1);">
                  <tr style="background:#fdfaf3;">
                    <td colspan="3" style="padding:11px 16px;text-align:right;font-family:'Trebuchet MS',Arial,sans-serif;font-size:11px;color:#8a7560;border-top:1px solid #f0ebe0;">Sub-Total</td>
                    <td style="padding:11px 16px;text-align:right;font-family:Georgia,serif;font-size:12px;color:#5a4a30;width:74px;border-top:1px solid #f0ebe0;">${fmt(subTotal)}</td>
                  </tr>
                  <tr style="background:#f9f5ec;">
                    <td colspan="3" style="padding:11px 16px;text-align:right;font-family:'Trebuchet MS',Arial,sans-serif;font-size:11px;color:#8a7560;border-top:1px solid #f0ebe0;">Shipping</td>
                    <td style="padding:11px 16px;text-align:right;font-family:Georgia,serif;font-size:12px;color:#5a4a30;border-top:1px solid #f0ebe0;">${fmt(shipping)}</td>
                  </tr>
                  ${tipRow}
                  <tr style="background:#fdfaf3;">
                    <td colspan="3" style="padding:11px 16px;text-align:right;font-family:'Trebuchet MS',Arial,sans-serif;font-size:11px;color:#8a7560;border-top:1px solid #f0ebe0;">Tax (10.25%)</td>
                    <td style="padding:11px 16px;text-align:right;font-family:Georgia,serif;font-size:12px;color:#5a4a30;border-top:1px solid #f0ebe0;">${fmt(tax)}</td>
                  </tr>
                  <!-- Grand Total -->
                  <tr>
                    <td colspan="3" class="grand-lbl" style="padding:18px 16px;text-align:right;font-family:Georgia,serif;font-size:10px;font-weight:700;letter-spacing:3px;color:#1a120a;text-transform:uppercase;background:linear-gradient(12deg,#c99000 0%,#e8b800 50%,#c99000 100%);border-top:2px solid #a07800;">Grand Total</td>
                    <td class="grand-val" style="padding:18px 16px;text-align:right;font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1a120a;background:linear-gradient(322deg,#c99000 0%,#e8b800 50%,#c99000 100%);border-top:2px solid #a07800;">${fmt(grandTotal)}</td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>

            <!-- ── Comment ── -->
            ${commentBlock}

            <!-- Spacer -->
            <div style="height:28px;"></div>

          </td>
        </tr>

        <!-- ════ FOOTER ════ -->
        <tr>
          <td style="background:#1a1008;padding:0;">
            <div style="height:1px;background:linear-gradient(90deg,transparent,#c99000 30%,#c99000 70%,transparent);"></div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:32px 40px;text-align:center;">

                  <!-- Footer logo -->
                  <img src="https://www.bourbonandwhisky.com/image/catalog/bw-fav.png"
                    alt="Bourbon &amp; Whisky"
                    width="90"
                    style="display:block;margin:0 auto 18px;max-width:120px;height:auto;border:0;outline:none;opacity:0.85;"
                  />

                  <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#a07840;text-transform:uppercase;">
                    Questions about your order?
                  </p>
                  <p style="margin:0 0 22px;font-family:'Georgia',serif;font-size:13px;color:#c8b08a;">
                    Reply to this email or reach us at&nbsp;
                    <a href="mailto:support@bourbonandwhisky.com"
                      style="color:#c99000;text-decoration:none;font-weight:700;border-bottom:1px solid #c99000;">
                      support@bourbonandwhisky.com
                    </a>
                  </p>

                  <div style="width:40px;height:1px;background:#a07840;margin:0 auto 18px;"></div>

                  <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#6b5230;letter-spacing:1px;">
                    &copy; ${new Date().getFullYear()} Bourbon &amp; Whisky. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
            <div style="height:3px;background:linear-gradient(90deg,#6b4100,#c99000,#e8b800,#c99000,#6b4100);"></div>
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