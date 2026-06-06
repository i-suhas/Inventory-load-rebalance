import { createServerFn } from "@tanstack/react-start";
import { seedDatabase } from "./seed.server.js";
import {
  getDashboardData,
  runForecastForWarehouse,
  generateRecommendations,
  computeRiskLevels,
  getSalesHistory,
} from "./inventory.server.js";

export const seedData = createServerFn({ method: "POST" }).handler(async () => {
  return seedDatabase();
});

export const fetchDashboard = createServerFn().handler(async () => {
  return getDashboardData();
});

export const runForecast = createServerFn({ method: "POST" })
  .inputValidator((d: { warehouse: string; product: string }) => d)
  .handler(async ({ data }) => {
    return runForecastForWarehouse(data.warehouse, data.product);
  });

export const runAllForecasts = createServerFn({ method: "POST" }).handler(async () => {
  const warehouses = ["A", "B", "C", "D"];
  const products = ["Mobile Phone", "Laptop", "Tablet", "Headphones", "Smart Watch"];
  const results = [];
  for (const warehouse of warehouses) {
    for (const product of products) {
      const r = await runForecastForWarehouse(warehouse, product);
      results.push(r);
    }
  }
  return results;
});

export const fetchRisk = createServerFn().handler(async () => {
  return computeRiskLevels();
});

export const runRecommendations = createServerFn({ method: "POST" }).handler(async () => {
  return generateRecommendations();
});

export const fetchSalesHistory = createServerFn({ method: "GET" })
  .inputValidator((d: { warehouse: string; product: string; days?: number }) => d)
  .handler(async ({ data }) => {
    return getSalesHistory(data.warehouse, data.product, data.days ?? 30);
  });
