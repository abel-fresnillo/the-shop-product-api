import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../src/data/products");
import request from "supertest";
import app from "../src/app";
import { resetStore } from "./helpers/setup";

beforeEach(() => {
  resetStore();
});

describe("GET /api/products", () => {
  it("returns 200 with an array of 20 products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(20);
  });

  it("each product has the expected fields", async () => {
    const res = await request(app).get("/api/products");
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
    const res = await request(app).get("/api/products/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("1");
    expect(res.body.name).toBe("Whole Milk");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/api/products/nonexistent");
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
    const res = await request(app).post("/api/products").send(newProduct);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newProduct);
    expect(res.body.id).toBeDefined();
    expect(typeof res.body.id).toBe("string");
  });

  it("returns 400 when a required field is missing", async () => {
    const { name: _name, ...incomplete } = newProduct;
    const res = await request(app).post("/api/products").send(incomplete);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 for an invalid price", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ ...newProduct, price: -1 });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a non-integer stock", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ ...newProduct, stock: 1.5 });
    expect(res.status).toBe(400);
  });

  it("the new product appears in GET /api/products", async () => {
    await request(app).post("/api/products").send(newProduct);
    const res = await request(app).get("/api/products");
    expect(res.body).toHaveLength(21);
  });
});

describe("PATCH /api/products/:id", () => {
  it("returns 200 with updated fields", async () => {
    const res = await request(app)
      .patch("/api/products/1")
      .send({ price: 3.99, stock: 45 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(3.99);
    expect(res.body.stock).toBe(45);
    expect(res.body.name).toBe("Whole Milk");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).patch("/api/products/nonexistent").send({ price: 1.0 });
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid price", async () => {
    const res = await request(app).patch("/api/products/1").send({ price: -5 });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/products/:id", () => {
  it("returns 204 on successful deletion", async () => {
    const res = await request(app).delete("/api/products/1");
    expect(res.status).toBe(204);
  });

  it("the deleted product no longer appears in GET /api/products", async () => {
    await request(app).delete("/api/products/1");
    const res = await request(app).get("/api/products");
    expect(res.body).toHaveLength(19);
    expect(res.body.find((p: { id: string }) => p.id === "1")).toBeUndefined();
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).delete("/api/products/nonexistent");
    expect(res.status).toBe(404);
  });
});
