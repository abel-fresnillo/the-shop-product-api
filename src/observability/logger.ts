import winston from "winston";
import LokiTransport from "winston-loki";

const transports: winston.transport[] = [new winston.transports.Console()];

if (process.env.LOKI_HOST && process.env.NODE_ENV !== "test") {
  transports.push(
    new LokiTransport({
      host: process.env.LOKI_HOST,
      basicAuth: `${process.env.GRAFANA_INSTANCE_ID}:${process.env.GRAFANA_API_TOKEN}`,
      labels: { app: "the-shop-product-api" },
      json: true,
      format: winston.format.json(),
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format:
    process.env.NODE_ENV === "development"
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      : winston.format.json(),
  transports,
});
