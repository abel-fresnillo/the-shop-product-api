import { randomUUID } from "crypto";
import { eq, ilike } from "drizzle-orm";
import { db } from "../db";
import { products as productsTable } from "../db/schema";
import { Product } from "../types/product";

export async function getProducts(): Promise<Product[]> {
  return db.select().from(productsTable);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const rows = await db.select().from(productsTable).where(eq(productsTable.id, id));
  return rows[0];
}

export async function createProduct(data: Omit<Product, "id">): Promise<Product> {
  const product = { id: randomUUID(), ...data };
  await db.insert(productsTable).values(product);
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id">>
): Promise<Product | undefined> {
  const rows = await db
    .update(productsTable)
    .set(data)
    .where(eq(productsTable.id, id))
    .returning();
  return rows[0];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const rows = await db
    .delete(productsTable)
    .where(eq(productsTable.id, id))
    .returning();
  return rows.length > 0;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return db.select().from(productsTable).where(eq(productsTable.category, category));
}

export async function findProductsByName(name: string): Promise<Product[]> {
  return db.select().from(productsTable).where(ilike(productsTable.name, `%${name}%`));
}

export async function resetProducts(): Promise<void> {
  // no-op in production — implemented by the test mock
}
