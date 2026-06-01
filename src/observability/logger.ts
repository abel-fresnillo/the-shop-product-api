import winston from "winston";
import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format:
    process.env.NODE_ENV === "development"
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      : winston.format.json(),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV !== "test" ? [new OpenTelemetryTransportV3()] : []),
  ],
});
