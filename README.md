# the-shop-product-api

REST API that exposes product data for The Shop storefront. Built with TypeScript and Express, deployed to Vercel, and backed by a Neon PostgreSQL database.

## API reference

All endpoints require the `x-api-key` header. The `/health` endpoint is public.

Base path: `/api/products`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check (no auth required) |
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Get a product by ID |
| `GET` | `/api/products/category/:category` | List products by category |
| `GET` | `/api/products/search?name=<query>` | Search products by name |
| `POST` | `/api/products` | Create a product |
| `PATCH` | `/api/products/:id` | Partially update a product |
| `DELETE` | `/api/products/:id` | Delete a product |

Rate limit: 200 requests per 15-minute window per IP.

### Product schema

```json
{
  "id": "string",
  "name": "string",
  "category": "string",
  "price": "number (non-negative)",
  "unit": "string",
  "stock": "integer (non-negative)"
}
```

## Local development

**Prerequisites:** Node.js 22, a Neon PostgreSQL connection string.

```bash
npm install
cp .env.example .env   # fill in the required values
npm run dev
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `PRODUCT_API_KEY` | Yes | 32-byte hex shared secret for API auth. Generate with `openssl rand -hex 32` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | No | Grafana Cloud OTLP gateway (e.g. `https://otlp-gateway-prod-us-east-3.grafana.net/otlp`) |
| `GRAFANA_INSTANCE_ID` | No | Numeric stack instance ID from Grafana Cloud |
| `GRAFANA_API_TOKEN` | No | Grafana API token with Metrics/Logs/Traces publisher scopes |
| `OTEL_SERVICE_NAME` | No | Service name shown in Grafana (default: `the-shop-product-api`) |
| `LOKI_HOST` | No | Grafana Cloud Loki push endpoint |
| `LOKI_USER` | No | Loki numeric user ID |
| `LOG_LEVEL` | No | `debug` \| `info` \| `warn` \| `error` (default: `info`) |
| `ALLOWED_ORIGINS` | No | Comma-separated list of exact origins for CORS |
| `ALLOWED_ORIGIN_PATTERN` | No | Regex pattern to allow additional origins (e.g. Vercel preview URLs) |

### Database

Schema is managed with [Drizzle ORM](https://orm.drizzle.team). After setting `DATABASE_URL`, push the schema:

```bash
npm run db:push
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with live reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server with OpenTelemetry instrumentation |
| `npm test` | Run tests with Vitest |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint with ESLint |
| `npm run db:push` | Push Drizzle schema to the database |

## Stack

- **Runtime:** Node.js 22, TypeScript
- **Framework:** Express
- **Database:** Neon PostgreSQL via Drizzle ORM
- **Validation:** Zod
- **Security:** Helmet, express-rate-limit, timing-safe API key auth
- **Observability:** OpenTelemetry (traces + metrics → Grafana Cloud), Winston + Loki (logs)
- **Testing:** Vitest + Supertest
- **Deployment:** Vercel

## CI/CD

| Workflow | Trigger | Steps |
|----------|---------|-------|
| CI | Push to `development`, PR to `main` | Lint → Build → Test → npm audit → Gitleaks → Snyk SCA + SAST |
| Deploy | Push to `main` | Deploy to Vercel (production) |

## Observability

Traces and metrics are exported via OTLP to **Grafana Cloud** (`prod-us-east-3`). Custom metrics:

| Metric | Type | Description |
|--------|------|-------------|
| `products.lookups.total` | Counter | Total product lookup operations |
| `products.not_found.total` | Counter | Lookups that returned no result |
| `products.search.results` | Histogram | Result count for search/category queries |
| `nodejs.heap.used` | Gauge | V8 heap used bytes |
| `nodejs.event_loop.lag` | Gauge | Event loop lag in milliseconds |

Structured logs are shipped to Grafana Cloud Loki. The `/health` endpoint is excluded from traces.
