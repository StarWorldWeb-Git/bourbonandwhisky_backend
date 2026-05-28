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

  /* ── Product rows ── */
  const productRows = products.map((p) => {
    const optionsHtml = (p?.option || p?.options || []).map(opt => `
      <div style="margin-top:6px;padding:5px 10px 5px 12px;background:#fffbf0;border-left:3px solid #c99000;border-radius:0 4px 4px 0;">
        <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a07840;">${opt.name}:</span>
        <span style="font-family:Georgia,serif;color:#5a4a30;font-style:italic;font-size:11px;margin-left:4px;">${opt.value}</span>
      </div>
    `).join("");

    return `
    <tr>
      <td style="padding:16px 16px;border-bottom:1px solid #f0ebe0;vertical-align:top;word-break:break-word;min-width:0;">
        <span style="display:block;font-family:Georgia,serif;font-weight:700;font-size:13px;color:#1a120a;line-height:1.5;">${p.name}</span>
        <span style="display:block;font-family:'Trebuchet MS',Arial,sans-serif;font-size:10px;color:#b09060;margin-top:2px;letter-spacing:0.5px;">MODEL: ${p.model}</span>
        ${optionsHtml}
      </td>
      <td style="padding:16px 10px;border-bottom:1px solid #f0ebe0;text-align:center;vertical-align:top;font-family:Georgia,serif;font-size:13px;color:#5a4a30;white-space:nowrap;min-width:36px;">${p.quantity}</td>
      <td style="padding:16px 10px;border-bottom:1px solid #f0ebe0;text-align:right;vertical-align:top;font-family:Georgia,serif;font-size:13px;color:#5a4a30;white-space:nowrap;min-width:64px;">${fmt(p.price)}</td>
      <td style="padding:16px 16px 16px 10px;border-bottom:1px solid #f0ebe0;text-align:right;vertical-align:top;font-family:Georgia,serif;font-size:13px;font-weight:700;color:#b07800;white-space:nowrap;min-width:64px;">${fmt(p.total ?? p.price * p.quantity)}</td>
    </tr>`;
  }).join("");

  const tipRow = tip > 0 ? `
    <tr>
      <td colspan="3" style="padding:10px 16px;text-align:right;font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;color:#7a6a50;border-top:1px solid #f0ebe0;background:#fffdf8;">Team Support Tip</td>
      <td style="padding:10px 16px;text-align:right;font-family:Georgia,serif;font-size:12px;color:#5a4a30;border-top:1px solid #f0ebe0;background:#fffdf8;">${fmt(tip)}</td>
    </tr>` : "";

  const commentHtml = comment ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8dfc8;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(180,140,60,0.08);">
      <tr>
        <td style="background:linear-gradient(135deg,#2c1f0e 0%,#3d2a12 100%);padding:13px 20px;">
          <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:9px;letter-spacing:3px;color:#c99000;text-transform:uppercase;font-weight:700;">&#10022; Order Note / Gift Message</span>
        </td>
      </tr>
      <tr>
        <td style="background:#fffdf8;padding:20px 24px;font-family:Georgia,serif;font-size:13px;color:#5a4a30;line-height:1.8;font-style:italic;border-top:2px solid #c99000;">
          &#8220;${comment}&#8221;
        </td>
      </tr>
    </table>` : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmed — Bourbon &amp; Whisky</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
    body,.bg{background-color:#f5ede0 !important;}
    u+.bg{background-color:#f5ede0 !important;}
    [data-ogsc] body{background-color:#f5ede0 !important;}
    div[style*="margin: 16px 0"]{margin:0 !important;}
    @media only screen and (max-width:640px){
      .col-half{width:100% !important;display:block !important;}
      .col-half+.col-half{margin-top:12px !important;}
      .email-wrap{width:100% !important;}
      .prod-table{table-layout:fixed !important;width:100% !important;}
      .prod-col-qty{width:30px !important;}
      .prod-col-unit{width:56px !important;}
      .prod-col-total{width:62px !important;}
      .prod-table td,.prod-table th{padding-left:8px !important;padding-right:8px !important;}
      .meta-bar td{padding:14px 8px !important;}
      .meta-order-num{font-size:14px !important;}
      .grand-lbl,.grand-val{font-size:14px !important;padding:14px 12px !important;}
    }
  </style>
</head>
<body class="bg" style="margin:0;padding:0;background-color:#f5ede0 !important;font-family:Lato,Arial,sans-serif;">

<table class="bg" role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="background:#f5ede0 !important;padding:40px 16px;">
  <tr><td align="center">

    <table class="email-wrap" role="presentation" width="600" cellpadding="0" cellspacing="0"
      style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;
             box-shadow:0 8px 48px rgba(100,60,10,0.16),0 2px 8px rgba(100,60,10,0.08);
             border:1px solid #e0cfa8;">

      <!-- ══════════════════════════════════════════
           HEADER — white bg, logo centred, gold accents
      ══════════════════════════════════════════ -->
      <tr>
        <td style="background:#ffffff;padding:0;">

          
          
          <!-- Logo area -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:40px 40px 32px;text-align:center;background:#ffffff;">

                <!-- Logo on white — no background box, just the image centred -->
                <img
                  src="https://www.bourbonandwhisky.com/image/catalog/bw-and-dc_logo.png"
                  alt="Bourbon &amp; Whisky | Wine &amp; Spirits"
                  width="220"
                 style="display:block;margin:0 auto;max-width:220px;height:auto;border:0;outline:none;pointer-events:none;cursor:default;-webkit-user-drag:none;"
                />
                <!-- Fallback divider for email clients -->
                  <table role="presentation" width="340" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
                  <tr>
                    <td style="width:44%;border-bottom:1px solid #d4b96a;"></td>
                    <td style="text-align:center;padding:0 12px;color:#c99000;font-size:12px;line-height:1;white-space:nowrap;">&#10022;</td>
                    <td style="width:44%;border-bottom:1px solid #d4b96a;"></td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>

          <!-- Confirmed badge section — light cream bg -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#fdf8ee;padding:32px 40px 36px;text-align:center;border-top:1px solid #ede4c8;border-bottom:1px solid #ede4c8;">

                <!-- Badge -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                  <tr>
                    <td style="background:#1e1208;border-radius:28px;padding:11px 30px;border:1.5px solid #c99000;">
                      <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3.5px;color:#c99000;text-transform:uppercase;">✦ &nbsp;Order Confirmed&nbsp; ✦</span>
                    </td>
                  </tr>
                </table>

                <p style="margin:0;font-family:Georgia,serif;font-size:16px;color:#5a4a30;line-height:1.7;">
                  Thank you, <strong style="color:#1a120a;font-size:17px;">${firstname} ${lastname}</strong>.<br/>
                  <span style="font-size:14px;color:#8a7560;">Your order has been received and is being processed.</span>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ══════════════════════════════════════════
           ORDER META BAR — deep brown
      ══════════════════════════════════════════ -->
      <tr>
        <td style="background:#1e1208;padding:0;">
          <table class="meta-bar" role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:20px 24px;border-right:1px solid #3d2810;text-align:center;width:33.3%;">
                <span style="display:block;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2.5px;color:#8a6a30;text-transform:uppercase;margin-bottom:7px;">Order</span>
                <span class="meta-order-num" style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#c99000;letter-spacing:1px;">#${order_id}</span>
              </td>
              <td style="padding:20px 24px;border-right:1px solid #3d2810;text-align:center;width:33.3%;">
                <span style="display:block;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2.5px;color:#8a6a30;text-transform:uppercase;margin-bottom:7px;">Date</span>
                <span style="font-family:Georgia,serif;font-size:13px;color:#e0c98a;font-style:italic;">${orderDate}</span>
              </td>
              <td style="padding:20px 24px;text-align:center;width:33.3%;">
                <span style="display:block;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2.5px;color:#8a6a30;text-transform:uppercase;margin-bottom:7px;">Status</span>
                <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#6fcf97;">● Pending</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ══════════════════════════════════════════
           BODY — pure white
      ══════════════════════════════════════════ -->
      <tr>
        <td style="background:#ffffff;padding:0;">

          <!-- ── Customer Info ── -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:32px 28px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                  style="border:1px solid #e8dfc8;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(180,140,60,0.07);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#2c1f0e 0%,#3d2a12 100%);padding:12px 18px;">
                      <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:3px;color:#c99000;text-transform:uppercase;font-weight:700;">Customer</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#ffffff;padding:0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:16px 20px;border-right:1px solid #f0ebe0;width:50%;">
                            <span style="display:block;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2px;color:#a07840;text-transform:uppercase;margin-bottom:6px;">Name</span>
                            <span style="font-family:Georgia,serif;font-size:15px;color:#1a120a;font-weight:700;">${firstname} ${lastname}</span>
                          </td>
                          <td style="padding:16px 20px;width:50%;">
                            <span style="display:block;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2px;color:#a07840;text-transform:uppercase;margin-bottom:6px;">Email</span>
                            <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;color:#1a120a;word-break:break-all;">${email}</span>
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
                    <td class="col-half" style="width:50%;padding-right:10px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                        style="border:1px solid #e8dfc8;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(180,140,60,0.07);">
                        <tr>
                          <td style="background:linear-gradient(135deg,#2c1f0e 0%,#3d2a12 100%);padding:12px 18px;">
                            <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:3px;color:#c99000;text-transform:uppercase;font-weight:700;">Shipping Details</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#ffffff;padding:18px 20px;">
                            <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:14px;font-weight:700;color:#1a120a;">${shipping_firstname} ${shipping_lastname}</p>
                            <p style="margin:0 0 2px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;color:#7a6a50;line-height:1.7;">${shipping_address_1}${shipping_address_2 ? ", " + shipping_address_2 : ""}</p>
                            <p style="margin:0 0 2px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;color:#7a6a50;">${shipping_city}, ${shipping_zone} ${shipping_postcode}</p>
                            <p style="margin:0 0 16px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;color:#7a6a50;">${shipping_country}</p>
                            <div style="height:1px;background:linear-gradient(90deg,#e8dfc8,transparent);margin-bottom:12px;"></div>
                            <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2px;color:#a07840;text-transform:uppercase;display:block;margin-bottom:5px;">Method</span>
                            <span style="font-family:Georgia,serif;font-size:13px;color:#1a120a;font-weight:600;">${shipping_method}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <!-- Payment -->
                    <td class="col-half" style="width:50%;padding-left:10px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                        style="border:1px solid #e8dfc8;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(180,140,60,0.07);">
                        <tr>
                          <td style="background:linear-gradient(135deg,#2c1f0e 0%,#3d2a12 100%);padding:12px 18px;">
                            <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:3px;color:#c99000;text-transform:uppercase;font-weight:700;">Payment Details</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#ffffff;padding:18px 20px;">
                            <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:14px;font-weight:700;color:#1a120a;">${payment_firstname} ${payment_lastname}</p>
                            <p style="margin:0 0 2px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;color:#7a6a50;line-height:1.7;">${payment_address_1}</p>
                            <p style="margin:0 0 16px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;color:#7a6a50;">${payment_city}, ${payment_zone}</p>
                            <div style="height:1px;background:linear-gradient(90deg,#e8dfc8,transparent);margin-bottom:12px;"></div>
                            <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2px;color:#a07840;text-transform:uppercase;display:block;margin-bottom:5px;">Method</span>
                            <span style="font-family:Georgia,serif;font-size:13px;color:#1a120a;font-weight:600;">${payment_method}</span>
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
          ${commentHtml ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:24px 28px 0;">${commentHtml}</td></tr>
          </table>` : ''}

          <div style="height:32px;"></div>

        </td>
      </tr>

      <!-- ══════════════════════════════════════════
           FOOTER
      ══════════════════════════════════════════ -->
      <tr>
        <td style="background:#ffffff;padding:0;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#c99000 30%,#f5d060 50%,#c99000 70%,transparent);"></div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:36px 40px 32px;text-align:center;">

                <!-- Footer logo — on dark bg, slightly transparent -->
                <img src="https://www.bourbonandwhisky.com/image/catalog/bw-and-dc_logo.png"
                  alt="Bourbon &amp; Whisky" width="140"
                  style="display:block;margin:0 auto 20px;max-width:140px;height:auto;border:0;outline:none;opacity:0.9;filter:brightness(1.1);"/>

                <!-- Gold thin rule -->
                <div style="width:60px;height:1px;background:#c99000;margin:0 auto 20px;opacity:0.6;"></div>

                <p style="margin:0 0 6px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;color:#8a6a30;text-transform:uppercase;">
                  Questions about your order?
                </p>
                <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:13px;color:#c8b08a;font-style:italic;">
                  Reply to this email or reach us at&nbsp;
                  <a href="mailto:support@bourbonandwhisky.com"
                    style="color:#c99000;text-decoration:none;font-style:normal;font-weight:700;border-bottom:1px dotted #c99000;">
                    support@bourbonandwhisky.com
                  </a>
                </p>

                <div style="width:40px;height:1px;background:#3d2a12;margin:0 auto 20px;"></div>

                <p style="margin:0;font-family:'Trebuchet MS',Arial,sans-serif;font-size:9px;color:#5a4020;letter-spacing:1.5px;text-transform:uppercase;">
                  &copy; ${new Date().getFullYear()} Bourbon &amp; Whisky &nbsp;·&nbsp; All rights reserved.
                </p>
              </td>
            </tr>
          </table>
             </td>
      </tr>

    </table>
  </td></tr>
</table>

</body>
</html>
  `.trim();
};