import { describe, it, expect, vi } from "vitest";

vi.mock("../src/data/products");
import * as productsData from "../src/data/products";
import request from "supertest";
import app from "../src/app";
import { api } from "./helpers/setup";

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("API key middleware", () => {
  it("returns 401 when x-api-key header is missing", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when x-api-key header is wrong", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("x-api-key", "wrong-key");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });
});

describe("404 handler", () => {
  it("returns 404 for an unknown GET route", async () => {
    const res = await api.get("/api/unknown-route-that-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });

  it("returns 404 for an unknown POST route", async () => {
    const res = await api.post("/completely/unknown");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });
});

describe("global error handler", () => {
  it("returns 500 when a route handler throws", async () => {
    vi.spyOn(productsData, "getProducts").mockRejectedValueOnce(new Error("DB exploded"));
    const res = await api.get("/api/products");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });
});
