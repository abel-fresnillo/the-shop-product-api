/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      exclude: [
        "src/instrumentation.ts",
        "src/server.ts",
        "src/data/products.ts",
        "src/observability/**",
        "src/db/**",
        "drizzle.config.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
