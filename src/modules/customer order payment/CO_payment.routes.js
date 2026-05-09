import { Router } from 'express'
import express from 'express'
import { createIntent, handleWebhook } from './CO_payment.controller.js';

const CO_paymentRouter = Router()

CO_paymentRouter.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

CO_paymentRouter.post("/create-intent", createIntent);

export default CO_paymentRouter;