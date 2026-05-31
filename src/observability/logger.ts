import pino from "pino";
import { trace } from "@opentelemetry/api";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  mixin() {
    const span = trace.getActiveSpan();
    if (!span) return {};
    const { traceId, spanId } = span.spanContext();
    return { traceId, spanId };
  },
  // pino-opentelemetry-transport uses worker threads which are not supported
  // on Vercel serverless. In development use pino-pretty for readability;
  // in production write structured JSON to stdout (captured by Vercel logs).
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty" }
      : undefined,
});
