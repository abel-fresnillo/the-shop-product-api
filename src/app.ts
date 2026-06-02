import "dotenv/config";
import "./instrumentation";
import { timingSafeEqual } from "crypto";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import productsRouter from "./routes/products";
import { logger } from "./observability/logger";

const app = express();

app.use(cors({ origin: "https://project-mz5vn.vercel.app" }));
app.use(express.json({ limit: "10kb" }));
app.use(helmet());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const providedKey = req.headers["x-api-key"];
  const expectedKey = process.env.PRODUCT_API_KEY;

  const isValid =
    typeof providedKey === "string" &&
    typeof expectedKey === "string" &&
    providedKey.length === expectedKey.length &&
    timingSafeEqual(Buffer.from(providedKey), Buffer.from(expectedKey));

  if (!isValid) {
    logger.warn("Unauthorized request", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

app.use("/api", apiLimiter);

app.use("/api/products", productsRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
