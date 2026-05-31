import "dotenv/config";
import "./instrumentation";
import app from "./app";
import { startEventLoopMonitoring } from "./observability/metrics";
import { logger } from "./observability/logger";

const PORT = process.env.PORT ?? 3000;

if (process.env.NODE_ENV !== "test") {
  startEventLoopMonitoring();
}

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
