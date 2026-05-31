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
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty" }
      : process.env.NODE_ENV !== "test"
        ? {
            target: "pino-opentelemetry-transport",
            options: {
              resourceAttributes: {
                "service.name":
                  process.env.OTEL_SERVICE_NAME ?? "the-shop-product-api",
              },
            },
          }
        : undefined,
});
