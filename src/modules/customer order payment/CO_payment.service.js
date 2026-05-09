import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET);


export const createPaymentIntent = async ({ amount, currency = "usd", customer_email }) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), 
    currency,
    receipt_email: customer_email,
    metadata: {
      source: "bourbonandwhisky_checkout",
    },
  });

  return {
    client_secret: paymentIntent.client_secret, 
    payment_intent_id: paymentIntent.id,
  };
};


export const constructWebhookEvent = (rawBody, signature) => {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

