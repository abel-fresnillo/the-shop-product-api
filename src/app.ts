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

const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean)
);
const ALLOWED_ORIGIN_PATTERN = process.env.ALLOWED_ORIGIN_PATTERN
  ? new RegExp(process.env.ALLOWED_ORIGIN_PATTERN)
  : null;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.has(origin) || ALLOWED_ORIGIN_PATTERN?.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
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
