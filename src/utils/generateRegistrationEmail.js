export const generateRegistrationEmail = ({
  firstname,
  lastname,
  email,
}) => {

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome to Bourbon &amp; Whisky</title>
  <style>
    body,.bg{background-color:#f5ede0 !important;}
    u+.bg{background-color:#f5ede0 !important;}
    [data-ogsc] body{background-color:#f5ede0 !important;}
    div[style*="margin: 16px 0"]{margin:0 !important;}
    @media only screen and (max-width:640px){
      .email-wrap{width:100% !important;}
      .hero-title{font-size:26px !important;}
      .info-cell{display:block !important;width:100% !important;padding:14px 16px !important;}
      .info-cell+.info-cell{border-left:none !important;border-top:1px solid #f0ebe0 !important;}
    }
  </style>
</head>
<body class="bg" style="margin:0;padding:0;background-color:#f5ede0 !important;">

<table class="bg" role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="background:#f5ede0 !important;padding:40px 16px;">
  <tr><td align="center">

    <table class="email-wrap" role="presentation" width="600" cellpadding="0" cellspacing="0"
      style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;
             box-shadow:0 8px 48px rgba(100,60,10,0.16),0 2px 8px rgba(100,60,10,0.08);
             border:1px solid #e0cfa8;">

      <!-- ══ TOP GOLD BAR ══ -->
      <tr>
        <td style="background:#c99000;height:4px;font-size:0;line-height:0;">&nbsp;</td>
      </tr>

      <!-- ══ HEADER — white, logo ══ -->
      <tr>
        <td style="background:#1e1208;padding:5px 10px ;text-align:center;">

          <img
            src="https://www.bourbonandwhisky.com/image/catalog/bw-fav.png"
            alt="Bourbon &amp; Whisky"
            width="100"
            draggable="false"
            style="display:block;margin:0 auto;max-width:200px;height:auto;border:0;outline:none;pointer-events:none;cursor:default;-webkit-user-drag:none;"
          />

        </td>
      </tr>

      
      <!-- ══ HERO BANNER — dark ══ -->
      <tr>
        <td style="background:#1e1208;padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:44px 40px 40px;text-align:center;">

                <!-- Welcome badge -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 22px;">
                  <tr>
                    <td style="background:transparent;border:1.5px solid #c99000;border-radius:24px;padding:9px 26px;">
                      <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:3.5px;color:#c99000;text-transform:uppercase;">&#10022; &nbsp;Welcome to the Club&nbsp; &#10022;</span>
                    </td>
                  </tr>
                </table>

                <p class="hero-title" style="margin:0 0 14px;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#f5e6c0;line-height:1.25;letter-spacing:-0.5px;">
                  Welcome,<br/><em style="color:#c99000;">${firstname} ${lastname}</em>
                </p>

                <p style="margin:0 0 28px;font-family:Georgia,serif;font-size:14px;color:#c8b08a;line-height:1.8;max-width:420px;margin-left:auto;margin-right:auto;">
                  Your account has been created. You're now part of an exclusive community of fine spirits enthusiasts.
                </p>

                <!-- CTA Button -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="background:#c99000;border-radius:28px;padding:14px 36px;">
                      <a href="https://www.bourbonandwhisky.com/account"
                        style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2.5px;color:#1a1008;text-decoration:none;text-transform:uppercase;">
                        Visit My Account
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
          <!-- Bottom gold line -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:2px;background:#c99000;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
        </td>
      </tr>

      <!-- ══ ACCOUNT DETAILS CARD ══ -->
      <tr>
        <td style="background:#ffffff;padding:32px 28px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="border:1px solid #e8dfc8;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(180,140,60,0.07);">

            <!-- Card header -->
            <tr>
              <td style="background:linear-gradient(135deg,#2c1f0e 0%,#3d2a12 100%);padding:12px 20px;">
                <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:3px;color:#c99000;text-transform:uppercase;font-weight:700;">Your Account Details</span>
              </td>
            </tr>

            <!-- Info row -->
            <tr>
              <td style="background:#ffffff;padding:0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="info-cell" style="padding:18px 20px;border-right:1px solid #f0ebe0;width:33.3%;vertical-align:top;">
                      <span style="display:block;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2px;color:#a07840;text-transform:uppercase;margin-bottom:6px;">Full Name</span>
                      <span style="font-family:Georgia,serif;font-size:14px;color:#1a120a;font-weight:700;">${firstname} ${lastname}</span>
                    </td>
                    <td class="info-cell" style="padding:18px 20px;border-right:1px solid #f0ebe0;width:33.3%;vertical-align:top;">
                      <span style="display:block;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2px;color:#a07840;text-transform:uppercase;margin-bottom:6px;">Email Address</span>
                      <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;color:#1a120a;word-break:break-all;">${email}</span>
                    </td>
                    <td class="info-cell" style="padding:18px 20px;width:33.3%;vertical-align:top;">
                      <span style="display:block;font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:2px;color:#a07840;text-transform:uppercase;margin-bottom:6px;">Account Status</span>
                      <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:11px;font-weight:700;color:#6fcf97;letter-spacing:1px;">&#9679; Active</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- ══ PERKS SECTION ══ -->
      <tr>
        <td style="background:#ffffff;padding:24px 28px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="border:1px solid #e8dfc8;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(180,140,60,0.07);">

            <tr>
              <td style="background:linear-gradient(135deg,#2c1f0e 0%,#3d2a12 100%);padding:12px 20px;">
                <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:8px;letter-spacing:3px;color:#c99000;text-transform:uppercase;font-weight:700;">What You Get As A Member</span>
              </td>
            </tr>

            <tr>
              <td style="background:#fffdf8;padding:24px 24px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                  <!-- Perk 1 -->
                  <tr>
                    <td style="padding-bottom:16px;vertical-align:top;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:top;padding-right:14px;padding-top:1px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="width:28px;height:28px;background:#c99000;border-radius:50%;text-align:center;vertical-align:middle;font-size:13px;color:#1a1008;line-height:28px;">&#9670;</td>
                              </tr>
                            </table>
                          </td>
                          <td style="vertical-align:top;">
                            <span style="display:block;font-family:Georgia,serif;font-size:13px;font-weight:700;color:#1a120a;margin-bottom:3px;">Exclusive Member Pricing</span>
                            <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:11px;color:#8a7560;line-height:1.6;">Access member-only deals and early access to limited releases.</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Perk 2 -->
                  <tr>
                    <td style="padding-bottom:16px;vertical-align:top;border-top:1px solid #f0ebe0;padding-top:16px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:top;padding-right:14px;padding-top:1px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="width:28px;height:28px;background:#c99000;border-radius:50%;text-align:center;vertical-align:middle;font-size:13px;color:#1a1008;line-height:28px;">&#9670;</td>
                              </tr>
                            </table>
                          </td>
                          <td style="vertical-align:top;">
                            <span style="display:block;font-family:Georgia,serif;font-size:13px;font-weight:700;color:#1a120a;margin-bottom:3px;">Order History &amp; Tracking</span>
                            <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:11px;color:#8a7560;line-height:1.6;">Track all your orders and reorder your favourites with one click.</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Perk 3 -->
                  <tr>
                    <td style="vertical-align:top;border-top:1px solid #f0ebe0;padding-top:16px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:top;padding-right:14px;padding-top:1px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="width:28px;height:28px;background:#c99000;border-radius:50%;text-align:center;vertical-align:middle;font-size:13px;color:#1a1008;line-height:28px;">&#9670;</td>
                              </tr>
                            </table>
                          </td>
                          <td style="vertical-align:top;">
                            <span style="display:block;font-family:Georgia,serif;font-size:13px;font-weight:700;color:#1a120a;margin-bottom:3px;">Curated Recommendations</span>
                            <span style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:11px;color:#8a7560;line-height:1.6;">Get personalised picks based on your taste and purchase history.</span>
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

      <!-- ══ EXPLORE CTA ══ -->
      <tr>
        <td style="background:#ffffff;padding:28px 28px 32px;text-align:center;">
          <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:14px;color:#8a7560;font-style:italic;line-height:1.7;">
            Ready to explore our curated selection of<br/>the world's finest bourbons and whiskies?
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="background:#1e1208;border:1.5px solid #c99000;border-radius:28px;padding:13px 32px;">
                <a href="https://www.bourbonandwhisky.com"
                  style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;color:#c99000;text-decoration:none;text-transform:uppercase;">
                  &#10022; &nbsp;Shop Now&nbsp; &#10022;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ══ FOOTER ══ -->
      <tr>
        <td style="background:#1e1208;padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:1px;background:#c99000;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:32px 40px 28px;text-align:center;">

                 <img src="https://www.bourbonandwhisky.com/image/catalog/bw-fav.png"
                    alt="Bourbon &amp; Whisky"
                    width="90"
                    style="display:block;margin:0 auto 18px;max-width:120px;height:auto;border:0;outline:none;opacity:0.85;"
                  />
                <table role="presentation" width="60" cellpadding="0" cellspacing="0" style="margin:0 auto 18px;">
                  <tr><td style="height:1px;background:#c99000;font-size:0;line-height:0;opacity:0.5;">&nbsp;</td></tr>
                </table>

                <p style="margin:0 0 6px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;color:#8a6a30;text-transform:uppercase;">
                  Need help?
                </p>
                <p style="margin:0 0 22px;font-family:Georgia,serif;font-size:13px;color:#c8b08a;font-style:italic;">
                  Reply to this email or reach us at&nbsp;
                  <a href="mailto:support@bourbonandwhisky.com"
                    style="color:#c99000;text-decoration:none;font-style:normal;font-weight:700;border-bottom:1px dotted #c99000;">
                    support@bourbonandwhisky.com
                  </a>
                </p>

                <table role="presentation" width="40" cellpadding="0" cellspacing="0" style="margin:0 auto 18px;">
                  <tr><td style="height:1px;background:#3d2a12;font-size:0;line-height:0;">&nbsp;</td></tr>
                </table>

                <p style="margin:0;font-family:'Trebuchet MS',Arial,sans-serif;font-size:9px;color:#5a4020;letter-spacing:1.5px;text-transform:uppercase;">
                  &copy; ${new Date().getFullYear()} Bourbon &amp; Whisky &nbsp;&#183;&nbsp; All rights reserved.
                </p>
                <p style="margin:8px 0 0;font-family:'Trebuchet MS',Arial,sans-serif;font-size:9px;color:#3d2a12;letter-spacing:0.5px;">
                  You received this email because you created an account on bourbonandwhisky.com
                </p>

              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:4px;background:#c99000;font-size:0;line-height:0;">&nbsp;</td></tr>
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