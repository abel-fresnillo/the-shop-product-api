import { randomUUID } from "crypto";
import { eq, ilike } from "drizzle-orm";
import { SpanStatusCode } from "@opentelemetry/api";
import { db } from "../db";
import { products as productsTable } from "../db/schema";
import { Product } from "../types/product";
import { getTracer } from "../observability/tracer";
import {
  productLookups,
  productNotFound,
  searchResultSize,
} from "../observability/metrics";
import { logger } from "../observability/logger";

export async function getProducts(): Promise<Product[]> {
  return getTracer().startActiveSpan("db.getProducts", async (span) => {
    try {
      span.setAttributes({
        "db.system": "postgresql",
        "db.operation": "SELECT",
        "db.sql.table": "products",
      });
      const rows = await db.select().from(productsTable);
      span.setAttribute("db.rows_returned", rows.length);
      productLookups.add(1, { operation: "list" });
      return rows;
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (err as Error).message,
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

export async function getProductById(
  id: string
): Promise<Product | undefined> {
  return getTracer().startActiveSpan("db.getProductById", async (span) => {
    try {
      span.setAttributes({
        "db.system": "postgresql",
        "db.operation": "SELECT",
        "db.sql.table": "products",
        "product.id": id,
      });
      const rows = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, id));
      span.setAttribute("db.rows_returned", rows.length);
      productLookups.add(1, { operation: "get" });
      if (!rows[0]) {
        productNotFound.add(1, { operation: "get" });
        logger.warn({ productId: id }, "Product not found");
      }
      return rows[0];
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (err as Error).message,
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

export async function createProduct(
  data: Omit<Product, "id">
): Promise<Product> {
  return getTracer().startActiveSpan("db.createProduct", async (span) => {
    try {
      span.setAttributes({
        "db.system": "postgresql",
        "db.operation": "INSERT",
        "db.sql.table": "products",
        "product.category": data.category,
      });
      const product = { id: randomUUID(), ...data };
      await db.insert(productsTable).values(product);
      span.setAttribute("product.id", product.id);
      return product;
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (err as Error).message,
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id">>
): Promise<Product | undefined> {
  return getTracer().startActiveSpan("db.updateProduct", async (span) => {
    try {
      span.setAttributes({
        "db.system": "postgresql",
        "db.operation": "UPDATE",
        "db.sql.table": "products",
        "product.id": id,
      });
      const rows = await db
        .update(productsTable)
        .set(data)
        .where(eq(productsTable.id, id))
        .returning();
      span.setAttribute("db.rows_affected", rows.length);
      if (!rows[0]) {
        productNotFound.add(1, { operation: "update" });
        logger.warn({ productId: id }, "Product not found for update");
      }
      return rows[0];
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (err as Error).message,
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

export async function deleteProduct(id: string): Promise<boolean> {
  return getTracer().startActiveSpan("db.deleteProduct", async (span) => {
    try {
      span.setAttributes({
        "db.system": "postgresql",
        "db.operation": "DELETE",
        "db.sql.table": "products",
        "product.id": id,
      });
      const rows = await db
        .delete(productsTable)
        .where(eq(productsTable.id, id))
        .returning();
      span.setAttribute("db.rows_affected", rows.length);
      if (rows.length === 0) {
        productNotFound.add(1, { operation: "delete" });
        logger.warn({ productId: id }, "Product not found for delete");
      }
      return rows.length > 0;
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (err as Error).message,
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  return getTracer().startActiveSpan(
    "db.getProductsByCategory",
    async (span) => {
      try {
        span.setAttributes({
          "db.system": "postgresql",
          "db.operation": "SELECT",
          "db.sql.table": "products",
          "product.category": category,
        });
        const rows = await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.category, category));
        span.setAttribute("db.rows_returned", rows.length);
        productLookups.add(1, { operation: "category" });
        searchResultSize.record(rows.length, { operation: "category" });
        return rows;
      } catch (err) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (err as Error).message,
        });
        span.recordException(err as Error);
        throw err;
      } finally {
        span.end();
      }
    }
  );
}

export async function findProductsByName(name: string): Promise<Product[]> {
  return getTracer().startActiveSpan("db.findProductsByName", async (span) => {
    try {
      span.setAttributes({
        "db.system": "postgresql",
        "db.operation": "SELECT",
        "db.sql.table": "products",
      });
      const rows = await db
        .select()
        .from(productsTable)
        .where(ilike(productsTable.name, `%${name}%`));
      span.setAttribute("db.rows_returned", rows.length);
      productLookups.add(1, { operation: "search" });
      searchResultSize.record(rows.length, { operation: "search" });
      return rows;
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (err as Error).message,
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

export async function resetProducts(): Promise<void> {
  // no-op in production — implemented by the test mock
}
