import { randomUUID } from "crypto";
import { Product } from "../types/product";

const seedProducts: Product[] = [
  { id: "1", name: "Whole Milk", category: "dairy", price: 3.49, unit: "gallon", stock: 50 },
  { id: "2", name: "Large Eggs", category: "dairy", price: 4.99, unit: "dozen", stock: 80 },
  { id: "3", name: "Cheddar Cheese", category: "dairy", price: 5.79, unit: "lb", stock: 30 },
  { id: "4", name: "Butter", category: "dairy", price: 4.29, unit: "lb", stock: 40 },
  { id: "5", name: "Greek Yogurt", category: "dairy", price: 1.99, unit: "each", stock: 60 },
  { id: "6", name: "Gala Apples", category: "produce", price: 1.49, unit: "lb", stock: 100 },
  { id: "7", name: "Bananas", category: "produce", price: 0.29, unit: "lb", stock: 150 },
  { id: "8", name: "Carrots", category: "produce", price: 1.29, unit: "lb", stock: 70 },
  { id: "9", name: "Baby Spinach", category: "produce", price: 3.49, unit: "each", stock: 45 },
  { id: "10", name: "Roma Tomatoes", category: "produce", price: 1.79, unit: "lb", stock: 90 },
  { id: "11", name: "White Bread", category: "bakery", price: 2.99, unit: "each", stock: 35 },
  { id: "12", name: "Sourdough Loaf", category: "bakery", price: 5.49, unit: "each", stock: 20 },
  { id: "13", name: "Croissant", category: "bakery", price: 1.79, unit: "each", stock: 25 },
  { id: "14", name: "Orange Juice", category: "beverages", price: 4.49, unit: "each", stock: 55 },
  { id: "15", name: "Sparkling Water", category: "beverages", price: 1.29, unit: "each", stock: 120 },
  { id: "16", name: "Coffee Beans", category: "beverages", price: 12.99, unit: "each", stock: 30 },
  { id: "17", name: "Penne Pasta", category: "pantry", price: 1.59, unit: "each", stock: 85 },
  { id: "18", name: "Jasmine Rice", category: "pantry", price: 6.99, unit: "each", stock: 60 },
  { id: "19", name: "Extra Virgin Olive Oil", category: "pantry", price: 8.99, unit: "each", stock: 40 },
  { id: "20", name: "Canned Tomatoes", category: "pantry", price: 1.09, unit: "each", stock: 95 },
];

let products: Product[] = [...seedProducts];

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function createProduct(data: Omit<Product, "id">): Product {
  const product: Product = { id: randomUUID(), ...data };
  products.push(product);
  return product;
}

export function updateProduct(id: string, data: Partial<Omit<Product, "id">>): Product | undefined {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  products[index] = { ...products[index], ...data };
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

export function resetProducts(): void {
  products = [...seedProducts];
}
