import { db } from "../../db/index.js";
import { sales, inventory, returns, transfers, forecasts, recommendations } from "../../db/schema.js";

const WAREHOUSES = ["A", "B", "C", "D"];
const PRODUCTS = ["Mobile Phone", "Laptop", "Tablet", "Headphones", "Smart Watch"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export async function seedDatabase() {
  // Clear existing data
  await db.delete(recommendations);
  await db.delete(forecasts);
  await db.delete(transfers);
  await db.delete(returns);
  await db.delete(inventory);
  await db.delete(sales);

  // Seed sales (last 90 days)
  const salesData = [];
  for (let d = 89; d >= 0; d--) {
    for (const warehouse of WAREHOUSES) {
      for (const product of PRODUCTS) {
        const baseUnits = product === "Mobile Phone" ? 80 : product === "Laptop" ? 40 : product === "Tablet" ? 55 : product === "Headphones" ? 120 : 65;
        const seasonal = d < 14 ? 1.3 : d < 30 ? 1.1 : 1.0; // recent spike
        const warehouseMultiplier = warehouse === "A" ? 1.5 : warehouse === "B" ? 1.2 : warehouse === "C" ? 0.9 : 0.7;
        salesData.push({
          date: daysAgo(d),
          warehouse,
          product,
          units_sold: Math.floor(baseUnits * seasonal * warehouseMultiplier + randomInt(-15, 15)),
        });
      }
    }
  }
  await db.insert(sales).values(salesData);

  // Seed inventory (some warehouses critically low)
  const inventoryData = [];
  const criticalStocks: Record<string, number> = {
    "A-Mobile Phone": 180,
    "A-Laptop": 95,
    "B-Smart Watch": 220,
    "C-Tablet": 310,
    "D-Headphones": 150,
  };
  for (const warehouse of WAREHOUSES) {
    for (const product of PRODUCTS) {
      const key = `${warehouse}-${product}`;
      const stock = criticalStocks[key] ?? randomInt(400, 1800);
      inventoryData.push({ warehouse, product, stock, capacity: 2000 });
    }
  }
  await db.insert(inventory).values(inventoryData);

  // Seed returns (last 30 days)
  const returnsData = [];
  for (let d = 29; d >= 0; d--) {
    for (const warehouse of WAREHOUSES) {
      for (const product of PRODUCTS) {
        if (Math.random() > 0.4) continue;
        returnsData.push({
          date: daysAgo(d),
          warehouse,
          product,
          returned_qty: randomInt(2, 25),
        });
      }
    }
  }
  await db.insert(returns).values(returnsData);

  // Seed recent transfers
  const transfersData = [
    { from_warehouse: "B", to_warehouse: "A", product: "Mobile Phone", quantity: 200, status: "completed" },
    { from_warehouse: "C", to_warehouse: "A", product: "Laptop", quantity: 100, status: "completed" },
    { from_warehouse: "D", to_warehouse: "B", product: "Smart Watch", quantity: 150, status: "in_transit" },
  ];
  await db.insert(transfers).values(transfersData);

  return { seeded: true, salesRows: salesData.length };
}
