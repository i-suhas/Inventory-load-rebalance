CREATE TABLE "forecasts" (
	"id" serial PRIMARY KEY,
	"warehouse" text NOT NULL,
	"product" text NOT NULL,
	"forecast_date" date NOT NULL,
	"xgb_forecast" real,
	"tft_forecast" real,
	"ensemble_forecast" real,
	"confidence" real,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY,
	"warehouse" text NOT NULL,
	"product" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"capacity" integer DEFAULT 2000 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" serial PRIMARY KEY,
	"warehouse" text NOT NULL,
	"product" text NOT NULL,
	"action" text NOT NULL,
	"details" jsonb DEFAULT '{}' NOT NULL,
	"confidence" real,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "returns" (
	"id" serial PRIMARY KEY,
	"date" date NOT NULL,
	"warehouse" text NOT NULL,
	"product" text NOT NULL,
	"returned_qty" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY,
	"date" date NOT NULL,
	"warehouse" text NOT NULL,
	"product" text NOT NULL,
	"units_sold" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" serial PRIMARY KEY,
	"from_warehouse" text NOT NULL,
	"to_warehouse" text NOT NULL,
	"product" text NOT NULL,
	"quantity" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
