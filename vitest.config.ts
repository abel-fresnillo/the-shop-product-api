/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    env: {
      PRODUCT_API_KEY: "test-api-key",
      ALLOWED_ORIGINS: "https://test-allowed.vercel.app",
      ALLOWED_ORIGIN_PATTERN: "^https://preview-[\\w-]+\\.vercel\\.app$",
    },
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
