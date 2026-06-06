import { pgTable, serial, text, integer, date, timestamp, real, jsonb } from "drizzle-orm/pg-core";

export const sales = pgTable("sales", {
  id: serial().primaryKey(),
  date: date().notNull(),
  warehouse: text().notNull(),
  product: text().notNull(),
  units_sold: integer("units_sold").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial().primaryKey(),
  warehouse: text().notNull(),
  product: text().notNull(),
  stock: integer().notNull().default(0),
  capacity: integer().notNull().default(2000),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const returns = pgTable("returns", {
  id: serial().primaryKey(),
  date: date().notNull(),
  warehouse: text().notNull(),
  product: text().notNull(),
  returned_qty: integer("returned_qty").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const transfers = pgTable("transfers", {
  id: serial().primaryKey(),
  from_warehouse: text("from_warehouse").notNull(),
  to_warehouse: text("to_warehouse").notNull(),
  product: text().notNull(),
  quantity: integer().notNull(),
  status: text().notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

export const forecasts = pgTable("forecasts", {
  id: serial().primaryKey(),
  warehouse: text().notNull(),
  product: text().notNull(),
  forecast_date: date("forecast_date").notNull(),
  xgb_forecast: real("xgb_forecast"),
  tft_forecast: real("tft_forecast"),
  ensemble_forecast: real("ensemble_forecast"),
  confidence: real(),
  created_at: timestamp("created_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: serial().primaryKey(),
  warehouse: text().notNull(),
  product: text().notNull(),
  action: text().notNull(),
  details: jsonb().notNull().default({}),
  confidence: real(),
  status: text().notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});
