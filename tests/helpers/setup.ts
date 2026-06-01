import request from "supertest";
import app from "../../src/app";
import { resetProducts } from "../../src/data/products";

export function resetStore(): void {
  resetProducts();
}

export const api = {
  get: (url: string) =>
    request(app).get(url).set("x-api-key", process.env.PRODUCT_API_KEY!),
  post: (url: string) =>
    request(app).post(url).set("x-api-key", process.env.PRODUCT_API_KEY!),
  patch: (url: string) =>
    request(app).patch(url).set("x-api-key", process.env.PRODUCT_API_KEY!),
  delete: (url: string) =>
    request(app).delete(url).set("x-api-key", process.env.PRODUCT_API_KEY!),
};
