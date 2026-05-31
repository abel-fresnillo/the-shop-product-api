import { pgTable, text, doublePrecision, integer } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: doublePrecision("price").notNull(),
  unit: text("unit").notNull(),
  stock: integer("stock").notNull(),
});
