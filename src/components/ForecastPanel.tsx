import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Forecast = {
  id: number;
  warehouse: string;
  product: string;
  xgb_forecast: number | null;
  tft_forecast: number | null;
  ensemble_forecast: number | null;
  confidence: number | null;
};

type SalesAgg = {
  warehouse: string;
  product: string;
  avg_daily: number;
  recent_7d: number;
  recent_30d: number;
};

export default function ForecastPanel({
  forecasts,
  salesAgg,
  onRunForecast,
  loading,
}: {
  forecasts: Forecast[];
  salesAgg: SalesAgg[];
  onRunForecast: () => void;
  loading: boolean;
}) {
  const [selectedWarehouse, setSelectedWarehouse] = useState("A");
  const [selectedProduct, setSelectedProduct] = useState("Mobile Phone");

  const products = ["Mobile Phone", "Laptop", "Tablet", "Headphones", "Smart Watch"];
  const warehouses = ["A", "B", "C", "D"];

  const filteredForecasts = forecasts.filter(
    f => f.warehouse === selectedWarehouse && f.product === selectedProduct
  );

  const comparisonData = filteredForecasts.slice(0, 10).map((f, i) => ({
    name: `Run ${filteredForecasts.length - i}`,
    XGBoost: f.xgb_forecast ?? 0,
    TFT: f.tft_forecast ?? 0,
    Ensemble: f.ensemble_forecast ?? 0,
  })).reverse();

  const warehouseData = warehouses.map(wh => {
    const f = forecasts.find(x => x.warehouse === wh && x.product === selectedProduct);
    const s = salesAgg.find(x => x.warehouse === wh && x.product === selectedProduct);
    return {
      warehouse: `WH-${wh}`,
      Forecast: f?.ensemble_forecast ?? 0,
      Actual7d: s ? Number(s.recent_7d) : 0,
    };
  });

  const latestForecast = filteredForecasts[0];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 items-center">
          <label className="text-xs text-gray-400">Warehouse:</label>
          <select
            value={selectedWarehouse}
            onChange={e => setSelectedWarehouse(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            {warehouses.map(w => <option key={w} value={w}>Warehouse {w}</option>)}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-xs text-gray-400">Product:</label>
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            {products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button
          onClick={onRunForecast}
          disabled={loading}
          className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
        >
          {loading ? "Running…" : "⚡ Run AI Forecast"}
        </button>
      </div>

      {/* Ensemble result cards */}
      {latestForecast ? (
        <div className="grid grid-cols-3 gap-4">
          <ModelCard
            title="XGBoost"
            subtitle="Tabular + Calendar Features"
            value={latestForecast.xgb_forecast ?? 0}
            weight="40%"
            color="from-blue-600/20 border-blue-500/30"
            icon="🌲"
          />
          <ModelCard
            title="TFT (AI)"
            subtitle="Temporal Fusion Transformer"
            value={latestForecast.tft_forecast ?? 0}
            weight="60%"
            color="from-violet-600/20 border-violet-500/30"
            icon="🧠"
          />
          <ModelCard
            title="Ensemble"
            subtitle="Weighted combination"
            value={latestForecast.ensemble_forecast ?? 0}
            weight="final"
            color="from-emerald-600/20 border-emerald-500/30"
            icon="🎯"
            highlight
            confidence={latestForecast.confidence ?? 0}
          />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">No forecasts yet. Click "⚡ Run AI Forecast" to generate predictions.</p>
        </div>
      )}

      {/* Charts */}
      {comparisonData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">
              Model Comparison — {selectedProduct} · WH-{selectedWarehouse}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="XGBoost" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="TFT" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Ensemble" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">
              Cross-Warehouse Forecast vs Actual — {selectedProduct}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={warehouseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="warehouse" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Bar dataKey="Forecast" fill="#6366f1" radius={4} />
                <Bar dataKey="Actual7d" fill="#10b981" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function ModelCard({
  title,
  subtitle,
  value,
  weight,
  color,
  icon,
  highlight = false,
  confidence,
}: {
  title: string;
  subtitle: string;
  value: number;
  weight: string;
  color: string;
  icon: string;
  highlight?: boolean;
  confidence?: number;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${color} border rounded-xl p-5 ${highlight ? "ring-1 ring-emerald-500/30" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
          weight: {weight}
        </span>
      </div>
      <h3 className="font-semibold text-white text-sm">{title}</h3>
      <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-400 mt-1">units / 7d</p>
      {confidence !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Confidence</span>
            <span>{(confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full">
            <div
              className="h-1.5 bg-emerald-500 rounded-full"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
