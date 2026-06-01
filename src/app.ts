import "dotenv/config";
import "./instrumentation";
import express, { Request, Response, NextFunction } from "express";
import productsRouter from "./routes/products";
import { logger } from "./observability/logger";

const app = express();

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers["x-api-key"] !== process.env.PRODUCT_API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

app.use("/api/products", productsRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
