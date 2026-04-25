import cors from "cors";
import express from "express";
import productsRouter from "./modules/products/products.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "API is healthy" });
  });

  app.use("/api/v1/products", productsRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
