import cors from "cors";
import express from "express";
import productsRouter from "./modules/products/products.routes.js";
import categoriesRouter from "./modules/categories/category.routes.js";
import manufacturerRouter from "./modules/manufacturer/manufacturer.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

export function createApp() {
  const app = express();



  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "API is healthy" });
  });

  app.use("/api/v1/products", productsRouter);
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/manufacturer", manufacturerRouter)
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
