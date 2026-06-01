import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  findProductsByName,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../data/products";

const router = Router();

const ProductCreateSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  price: z.number().nonnegative(),
  unit: z.string().min(1).max(50),
  stock: z.number().int().nonnegative(),
});

const ProductPatchSchema = ProductCreateSchema.partial();

const NameQuerySchema = z.string().min(1).max(200);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getProducts());
  } catch (err) {
    next(err);
  }
});

router.get("/category/:category", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getProductsByCategory(req.params.category));
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.query;
  const nameResult = NameQuerySchema.safeParse(name);
  if (!nameResult.success) {
    res.status(400).json({ error: "Query parameter 'name' must be a non-empty string (max 200 chars)" });
    return;
  }
  try {
    res.json(await findProductsByName(nameResult.data));
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
  const result = ProductCreateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  try {
    const product = await createProduct(result.data);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const result = ProductPatchSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  if (Object.keys(result.data).length === 0) {
    res.status(400).json({ error: "No valid fields provided for update" });
    return;
  }
  try {
    const product = await updateProduct(req.params.id, result.data);
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
