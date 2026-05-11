// modules/payment/payment.controller.js

import { constructWebhookEvent, createPaymentIntent } from "./CO_payment.service.js";

 export  const createIntent = async (req, res) => {
    const { amount, customer_email } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount required" });
    }

    const intent = await createPaymentIntent({ amount, customer_email });

    return res.status(200).json({
      success: true,
      client_secret: intent.client_secret, 
    });

};


 export  const handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (error) {
    console.error("Webhook signature failed:", error.message);
    return res.status(400).json({ message: "Webhook Error" });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("Payment succeeded:", paymentIntent.id);
  }

  if (event.type === "payment_intent.payment_failed") {
    console.log("Payment failed:", event.data.object.id);
  }

  return res.status(200).json({ received: true });
};

