import { Router, Request, Response, NextFunction } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../data/products";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getProducts());
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { name, category, price, unit, stock } = req.body;

  if (!name || !category || price === undefined || !unit || stock === undefined) {
    res.status(400).json({ error: "Missing required fields: name, category, price, unit, stock" });
    return;
  }

  if (typeof price !== "number" || price < 0) {
    res.status(400).json({ error: "price must be a non-negative number" });
    return;
  }

  if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
    res.status(400).json({ error: "stock must be a non-negative integer" });
    return;
  }

  try {
    const product = await createProduct({ name, category, price, unit, stock });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { name, category, price, unit, stock } = req.body;

  if (price !== undefined && (typeof price !== "number" || price < 0)) {
    res.status(400).json({ error: "price must be a non-negative number" });
    return;
  }

  if (stock !== undefined && (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0)) {
    res.status(400).json({ error: "stock must be a non-negative integer" });
    return;
  }

  const patch: Partial<Omit<import("../types/product").Product, "id">> = {};
  if (name !== undefined) patch.name = name;
  if (category !== undefined) patch.category = category;
  if (price !== undefined) patch.price = price;
  if (unit !== undefined) patch.unit = unit;
  if (stock !== undefined) patch.stock = stock;

  try {
    const product = await updateProduct(req.params.id, patch);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
