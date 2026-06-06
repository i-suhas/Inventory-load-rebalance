"""Train explainable inventory forecasting and recommendation support models.

This script is intentionally separate from the Netlify application runtime. It
shows how the platform concepts can be trained offline, then exported as model
artifacts for review or later deployment.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import faiss
import joblib
import numpy as np
import pandas as pd
import torch
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from torch import nn
from xgboost import XGBRegressor


ROOT = Path(__file__).resolve().parent
DEFAULT_DATASET = ROOT / "data" / "inventory_training_sample.csv"
ARTIFACT_DIR = ROOT / "artifacts"


def build_features(frame: pd.DataFrame) -> pd.DataFrame:
    data = frame.copy()
    data["date"] = pd.to_datetime(data["date"])
    data = data.sort_values(["warehouse", "product", "date"])
    groups = data.groupby(["warehouse", "product"], group_keys=False)

    data["day_of_week"] = data["date"].dt.dayofweek
    data["lag_1"] = groups["units_sold"].shift(1)
    data["lag_3_mean"] = groups["units_sold"].rolling(3, min_periods=1).mean().reset_index(level=[0, 1], drop=True)
    data["stock_ratio"] = data["stock"] / data.groupby(["warehouse", "product"])["stock"].transform("max")
    data["net_demand"] = data["units_sold"] - data["returns"]
    return data.dropna().reset_index(drop=True)


class SimpleTFTStyleModel(nn.Module):
    """Compact temporal model inspired by TFT gating and sequence encoding."""

    def __init__(self, input_size: int, hidden_size: int = 24) -> None:
        super().__init__()
        self.encoder = nn.GRU(input_size=input_size, hidden_size=hidden_size, batch_first=True)
        self.gate = nn.Sequential(nn.Linear(hidden_size, hidden_size), nn.Sigmoid())
        self.head = nn.Sequential(nn.Linear(hidden_size, 16), nn.ReLU(), nn.Linear(16, 1))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        encoded, _ = self.encoder(x)
        last = encoded[:, -1, :]
        return self.head(last * self.gate(last)).squeeze(-1)


def train_xgboost(data: pd.DataFrame) -> tuple[Pipeline, dict[str, float], list[dict[str, object]]]:
    target = "units_sold"
    categorical = ["warehouse", "product"]
    numeric = ["stock", "returns", "lead_time_days", "promo_flag", "unit_cost", "holding_cost", "day_of_week", "lag_1", "lag_3_mean", "stock_ratio"]

    train, test = train_test_split(data, test_size=0.25, random_state=42)
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical),
            ("numeric", StandardScaler(), numeric),
        ]
    )
    model = XGBRegressor(
        n_estimators=120,
        max_depth=3,
        learning_rate=0.08,
        objective="reg:squarederror",
        random_state=42,
    )
    pipeline = Pipeline([("prep", preprocessor), ("model", model)])
    pipeline.fit(train[categorical + numeric], train[target])

    predictions = pipeline.predict(test[categorical + numeric])
    metrics = {"mae": float(mean_absolute_error(test[target], predictions))}

    feature_names = pipeline.named_steps["prep"].get_feature_names_out()
    importances = pipeline.named_steps["model"].feature_importances_
    explanation = sorted(
        [
            {"feature": str(name), "importance": float(score)}
            for name, score in zip(feature_names, importances, strict=False)
        ],
        key=lambda item: item["importance"],
        reverse=True,
    )[:8]
    return pipeline, metrics, explanation


def train_tft_style(data: pd.DataFrame) -> dict[str, float]:
    numeric = data[["units_sold", "stock", "returns", "lead_time_days", "promo_flag", "lag_1", "lag_3_mean"]].astype("float32")
    values = torch.tensor(numeric.to_numpy())
    sequence_length = 3
    sequences = []
    targets = []
    for index in range(sequence_length, len(values)):
        sequences.append(values[index - sequence_length:index])
        targets.append(values[index, 0])

    if not sequences:
        return {"mae": 0.0, "epochs": 0}

    x = torch.stack(sequences)
    y = torch.tensor(targets)
    model = SimpleTFTStyleModel(input_size=x.shape[-1])
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = nn.L1Loss()

    for _ in range(80):
        optimizer.zero_grad()
        loss = loss_fn(model(x), y)
        loss.backward()
        optimizer.step()

    ARTIFACT_DIR.mkdir(exist_ok=True)
    torch.save(model.state_dict(), ARTIFACT_DIR / "tft_style_forecaster.pt")
    return {"mae": float(loss_fn(model(x), y).detach().item()), "epochs": 80}


def build_faiss_index(data: pd.DataFrame) -> dict[str, object]:
    vectors = data[["units_sold", "stock", "returns", "lead_time_days", "promo_flag", "lag_1", "lag_3_mean", "stock_ratio"]].astype("float32").to_numpy()
    faiss.normalize_L2(vectors)
    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)
    faiss.write_index(index, str(ARTIFACT_DIR / "inventory_similarity.faiss"))
    return {"vectors": int(index.ntotal), "dimensions": int(vectors.shape[1])}


def recommend_actions(data: pd.DataFrame) -> list[dict[str, object]]:
    latest = data.sort_values("date").groupby(["warehouse", "product"], as_index=False).tail(1)
    recommendations = []
    for _, row in latest.iterrows():
        avg_daily = float(data[data["product"] == row["product"]]["units_sold"].mean())
        forecast_7d = avg_daily * 7
        safety_stock = avg_daily * 3
        deficit = max(0, forecast_7d + safety_stock - float(row["stock"]))
        if deficit <= 0:
            continue
        surplus = latest[(latest["product"] == row["product"]) & (latest["warehouse"] != row["warehouse"]) & (latest["stock"] > 500)]
        action = "Transfer Inventory" if not surplus.empty else "Procure Inventory"
        recommendations.append(
            {
                "warehouse": row["warehouse"],
                "product": row["product"],
                "action": action,
                "deficit": round(deficit),
                "reason": "Forecast demand plus safety stock exceeds available stock.",
            }
        )
    return recommendations


def main() -> None:
    parser = argparse.ArgumentParser(description="Train inventory forecasting models and explainability artifacts.")
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    args = parser.parse_args()

    ARTIFACT_DIR.mkdir(exist_ok=True)
    data = build_features(pd.read_csv(args.dataset))
    xgb_pipeline, xgb_metrics, xgb_explanation = train_xgboost(data)
    tft_metrics = train_tft_style(data)
    vector_summary = build_faiss_index(data)
    recommendations = recommend_actions(data)

    joblib.dump(xgb_pipeline, ARTIFACT_DIR / "xgboost_forecaster.joblib")
    report = {
        "dataset_rows": int(len(data)),
        "xgboost": {"metrics": xgb_metrics, "top_features": xgb_explanation},
        "tft_style_deep_learning": {"metrics": tft_metrics, "purpose": "Temporal sequence learner for demand context."},
        "faiss_vector_search": vector_summary,
        "optimization": {"objective": "Cover deficits while preserving source warehouse buffer stock."},
        "recommendations": recommendations,
    }
    (ARTIFACT_DIR / "training_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
