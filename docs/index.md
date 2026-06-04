# The Shop Product API

REST API that exposes product data for The Shop storefront. Built with TypeScript and Express, deployed to Vercel, and backed by a Neon PostgreSQL database.

## Overview

The Product API serves product listings and details consumed by the storefront. It connects to a Neon serverless Postgres database and is deployed as a serverless function on Vercel.

## Tech Stack

- **TypeScript** + **Express** for the API
- **Drizzle ORM** + **Neon PostgreSQL** for persistence
- **Vercel** for deployment

## Local Development

```bash
npm install
npm run dev
```

## Links

- [CI Workflow](https://github.com/abel-fresnillo/the-shop-product-api/actions/workflows/ci.yml)
- [Deploy Workflow](https://github.com/abel-fresnillo/the-shop-product-api/actions/workflows/deploy.yml)
