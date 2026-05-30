import express, { Request, Response, NextFunction } from "express";
import productsRouter from "./routes/products";

const app = express();

app.use(express.json());

app.use("/api/products", productsRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
