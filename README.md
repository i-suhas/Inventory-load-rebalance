# Intelligent Inventory Rebalancing System V2

A mini enterprise AI platform for supply chain intelligence. Predicts demand, detects stockout risk, and auto-generates optimized transfer/procurement recommendations across multiple warehouses.

## Key Technologies

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TanStack Start, TanStack Router, Recharts |
| Backend | TanStack Server Functions, Netlify Functions |
| Database | Netlify Database (Postgres) via Drizzle ORM |
| AI Forecasting | Anthropic Claude (Haiku) via Netlify AI Gateway |
| Styling | Tailwind CSS v4 |
| Deployment | Netlify |

## Features

- **Dual-model ensemble forecasting**: XGBoost-style tabular features + TFT (AI) = weighted ensemble (40/60)
- **Risk heatmap**: Per-product, per-warehouse risk scoring (CRITICAL / HIGH / MEDIUM / LOW)
- **Transfer map**: Visual SVG flow diagram of inter-warehouse stock movements
- **AI recommendations**: Automated Transfer, Procure, or Emergency Replenishment actions
- **Live dashboard**: 5 KPI cards, tabbed views, one-click AI pipeline execution

## Running Locally

```bash
npm install
netlify dev --port 8889
```

The app will be available at http://localhost:8889.

On first run, click **Seed Data** to populate the database, then **Run Forecasts** and **Get Recommendations** to see the full AI pipeline in action.

## Python Training Workspace

Separate Python model training assets are available in `ml/`. They include a sample inventory dataset, an XGBoost demand model, a compact TFT-style PyTorch sequence model, FAISS vector search, optimization-oriented recommendation logic, and explainability output.

```bash
cd ml
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train_inventory_models.py --dataset data/inventory_training_sample.csv
```

The training script writes reviewable model artifacts and `training_report.json` under `ml/artifacts/`.

## Database Schema

Tables: `sales`, `inventory`, `returns`, `transfers`, `forecasts`, `recommendations`
