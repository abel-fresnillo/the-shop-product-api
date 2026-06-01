import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../src/data/products");
import * as productsData from "../src/data/products";
import { resetStore, api } from "./helpers/setup";

beforeEach(() => {
  resetStore();
});

describe("GET /api/products", () => {
  it("returns 200 with an array of 20 products", async () => {
    const res = await api.get("/api/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(20);
  });

  it("each product has the expected fields", async () => {
    const res = await api.get("/api/products");
    const product = res.body[0];
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("category");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("unit");
    expect(product).toHaveProperty("stock");
  });
});

describe("GET /api/products/:id", () => {
  it("returns 200 with the product for a valid id", async () => {
    const res = await api.get("/api/products/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("1");
    expect(res.body.name).toBe("Whole Milk");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await api.get("/api/products/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /api/products", () => {
  const newProduct = {
    name: "Organic Honey",
    category: "pantry",
    price: 7.99,
    unit: "each",
    stock: 25,
  };

  it("returns 201 with the created product including a generated id", async () => {
    const res = await api.post("/api/products").send(newProduct);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newProduct);
    expect(res.body.id).toBeDefined();
    expect(typeof res.body.id).toBe("string");
  });

  it("returns 400 when a required field is missing", async () => {
    const { name: _name, ...incomplete } = newProduct;
    const res = await api.post("/api/products").send(incomplete);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 for an invalid price", async () => {
    const res = await api.post("/api/products").send({ ...newProduct, price: -1 });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a non-integer stock", async () => {
    const res = await api.post("/api/products").send({ ...newProduct, stock: 1.5 });
    expect(res.status).toBe(400);
  });

  it("returns 400 when price is a string instead of a number", async () => {
    const res = await api.post("/api/products").send({ ...newProduct, price: "7.99" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("accepts price of 0 (boundary value)", async () => {
    const res = await api.post("/api/products").send({ ...newProduct, price: 0 });
    expect(res.status).toBe(201);
  });

  it("accepts stock of 0 (boundary value)", async () => {
    const res = await api.post("/api/products").send({ ...newProduct, stock: 0 });
    expect(res.status).toBe(201);
  });

  it("the new product appears in GET /api/products", async () => {
    await api.post("/api/products").send(newProduct);
    const res = await api.get("/api/products");
    expect(res.body).toHaveLength(21);
  });
});

describe("PATCH /api/products/:id", () => {
  it("returns 200 with updated fields", async () => {
    const res = await api.patch("/api/products/1").send({ price: 3.99, stock: 45 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(3.99);
    expect(res.body.stock).toBe(45);
    expect(res.body.name).toBe("Whole Milk");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await api.patch("/api/products/nonexistent").send({ price: 1.0 });
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid price", async () => {
    const res = await api.patch("/api/products/1").send({ price: -5 });
    expect(res.status).toBe(400);
  });

  it("applies a partial update with only name changed", async () => {
    const res = await api.patch("/api/products/1").send({ name: "Whole Milk 2%" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Whole Milk 2%");
    expect(res.body.price).toBe(3.49);
    expect(res.body.category).toBe("dairy");
  });

  it("returns 400 for a negative stock", async () => {
    const res = await api.patch("/api/products/1").send({ stock: -3 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 for a fractional stock", async () => {
    const res = await api.patch("/api/products/1").send({ stock: 2.7 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("DELETE /api/products/:id", () => {
  it("returns 204 on successful deletion", async () => {
    const res = await api.delete("/api/products/1");
    expect(res.status).toBe(204);
  });

  it("the deleted product no longer appears in GET /api/products", async () => {
    await api.delete("/api/products/1");
    const res = await api.get("/api/products");
    expect(res.body).toHaveLength(19);
    expect(res.body.find((p: { id: string }) => p.id === "1")).toBeUndefined();
  });

  it("returns 404 for an unknown id", async () => {
    const res = await api.delete("/api/products/nonexistent");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/products/category/:category", () => {
  it("returns 200 with only products from the requested category", async () => {
    const res = await api.get("/api/products/category/dairy");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(5);
    expect(res.body.every((p: { category: string }) => p.category === "dairy")).toBe(true);
  });

  it("returns 200 with an empty array for an unknown category", async () => {
    const res = await api.get("/api/products/category/frozen");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 200 with an empty array when case does not match", async () => {
    const res = await api.get("/api/products/category/Dairy");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 200 with the correct count for produce", async () => {
    const res = await api.get("/api/products/category/produce");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(5);
  });
});

describe("GET /api/products/search", () => {
  it("returns 400 when name query param is absent", async () => {
    const res = await api.get("/api/products/search");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("name");
  });

  it("returns 400 when name is an empty string", async () => {
    const res = await api.get("/api/products/search?name=");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 200 with matching products for a valid name substring", async () => {
    const res = await api.get("/api/products/search?name=milk");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name.toLowerCase()).toContain("milk");
  });

  it("search is case-insensitive", async () => {
    const res = await api.get("/api/products/search?name=MILK");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.some((p: { name: string }) => p.name === "Whole Milk")).toBe(true);
  });

  it("returns 200 with an empty array when no products match", async () => {
    const res = await api.get("/api/products/search?name=zzznomatch");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("error propagation", () => {
  it("returns 500 when the data layer throws", async () => {
    vi.spyOn(productsData, "getProducts").mockRejectedValueOnce(new Error("DB exploded"));
    const res = await api.get("/api/products");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });
});
