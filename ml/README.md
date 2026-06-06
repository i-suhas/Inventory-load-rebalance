# Inventory ML Training Workspace

This folder keeps the Python model-training workflow separate from the Netlify dashboard runtime.

## What It Covers

- Time series forecasting feature engineering with lags, rolling demand, calendar features, stock ratios, and return signals.
- XGBoost demand forecasting for tabular supply chain features.
- A compact TFT-style deep learning model using gated temporal sequence encoding in PyTorch.
- FAISS vector search for finding similar inventory situations.
- Recommendation and optimization logic that prioritizes stockout coverage while preserving source buffers.
- Explainability output through XGBoost feature importance and a JSON training report.

## Run Locally

```bash
cd ml
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train_inventory_models.py --dataset data/inventory_training_sample.csv
```

The script writes artifacts to `ml/artifacts/`, including:

- `xgboost_forecaster.joblib`
- `tft_style_forecaster.pt`
- `inventory_similarity.faiss`
- `training_report.json`

The dashboard still uses Netlify Server Functions and Netlify Database for live application data. These Python files are provided as a transparent training and experimentation layer for GitHub review.
