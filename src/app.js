import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from  "cookie-parser"
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import productsRouter from "./modules/products/products.routes.js";
import categoriesRouter from "./modules/categories/category.routes.js";
import manufacturerRouter from "./modules/manufacturer/manufacturer.routes.js";
import customerRouter from "./modules/customer/customer.routes.js";
import orderRouter from "./modules/customer order details/order.routes.js";
export const createApp = () => {

  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials:true
    })
  );

  app.use(cookieParser())
  app.use(express.json());
  app.set('trust proxy', 1);
  app.use(helmet());

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "API is healthy" });
  });

  app.use("/api/v1/products", productsRouter);
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/manufacturer", manufacturerRouter);
  app.use("/api/v1/customer", customerRouter);
  app.use("/api/v1/customer-order",orderRouter)
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
