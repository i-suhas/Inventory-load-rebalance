import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  BrainCircuit,
  Database,
  GitBranch,
  Map,
  PackagePlus,
  RefreshCw,
  Sprout,
  Target,
  Warehouse,
} from "lucide-react";
import {
  fetchDashboard,
  seedData,
  runAllForecasts,
  runRecommendations,
} from "../server/inventory.functions.js";
import ForecastPanel from "../components/ForecastPanel.js";
import RiskHeatmap from "../components/RiskHeatmap.js";
import TransferMap from "../components/TransferMap.js";
import RecommendationsPanel from "../components/RecommendationsPanel.js";
import InventoryOverview from "../components/InventoryOverview.js";
import ModelOpsPanel from "../components/ModelOpsPanel.js";

export const Route = createFileRoute("/")({
  loader: async () => {
    return fetchDashboard();
  },
  component: Dashboard,
});

type Tab = "overview" | "forecast" | "risk" | "transfer" | "recommendations" | "modelOps";

function Dashboard() {
  const data = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState<string | null>(null);
  const [dashData, setDashData] = useState(data);

  const seedFn = useServerFn(seedData);
  const forecastFn = useServerFn(runAllForecasts);
  const recommendFn = useServerFn(runRecommendations);
  const refreshFn = useServerFn(fetchDashboard);

  const refresh = useCallback(async () => {
    const fresh = await refreshFn();
    setDashData(fresh);
  }, [refreshFn]);

  const handleSeed = async () => {
    setLoading("seed");
    await seedFn();
    await refresh();
    setLoading(null);
  };

  const handleForecast = async () => {
    setLoading("forecast");
    await forecastFn();
    await refresh();
    setLoading(null);
  };

  const handleRecommend = async () => {
    setLoading("recommend");
    await recommendFn();
    await refresh();
    setLoading(null);
  };

  const tabs: { id: Tab; label: string; icon: typeof Boxes }[] = [
    { id: "overview", label: "Overview", icon: Boxes },
    { id: "forecast", label: "Forecasts", icon: BarChart3 },
    { id: "risk", label: "Risk Heatmap", icon: AlertTriangle },
    { id: "transfer", label: "Transfer Map", icon: Map },
    { id: "recommendations", label: "Recommendations", icon: Target },
    { id: "modelOps", label: "Model Ops", icon: BrainCircuit },
  ];

  const { summary } = dashData;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
              IRS
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Inventory Rebalancing System</h1>
              <p className="text-xs text-gray-400">V2 · Explainable Enterprise AI Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSeed}
              disabled={!!loading}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Sprout size={14} aria-hidden="true" />
              {loading === "seed" ? "Seeding..." : "Seed Data"}
            </button>
            <button
              onClick={handleForecast}
              disabled={!!loading}
              className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Activity size={14} aria-hidden="true" />
              {loading === "forecast" ? "Forecasting..." : "Run Forecasts"}
            </button>
            <button
              onClick={handleRecommend}
              disabled={!!loading}
              className="px-3 py-1.5 text-xs rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white transition disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <PackagePlus size={14} aria-hidden="true" />
              {loading === "recommend" ? "Analyzing..." : "Get Recommendations"}
            </button>
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="max-w-screen-xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <KpiCard label="Total Stock" value={summary.totalStock.toLocaleString()} sub="units across all warehouses" color="blue" icon={Warehouse} />
          <KpiCard label="Warehouses" value={summary.totalWarehouses.toString()} sub="active locations" color="green" icon={Database} />
          <KpiCard label="Products" value={summary.totalProducts.toString()} sub="tracked SKUs" color="purple" icon={GitBranch} />
          <KpiCard label="High Risk" value={summary.highCount.toString()} sub="items need attention" color="yellow" icon={AlertTriangle} />
          <KpiCard label="Critical" value={summary.criticalCount.toString()} sub="immediate action required" color="red" icon={RefreshCw} />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex gap-1 border-b border-gray-800 mb-4 overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition whitespace-nowrap inline-flex items-center gap-2 ${
                activeTab === t.id
                  ? "bg-gray-800 text-white border-b-2 border-cyan-500"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {t.label}
            </button>
          )})}
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {activeTab === "overview" && <InventoryOverview data={dashData} />}
          {activeTab === "forecast" && (
            <ForecastPanel
              forecasts={dashData.forecasts}
              salesAgg={dashData.salesAggregated}
              onRunForecast={handleForecast}
              loading={loading === "forecast"}
            />
          )}
          {activeTab === "risk" && <RiskHeatmap risk={dashData.risk} />}
          {activeTab === "transfer" && <TransferMap transfers={dashData.transfers} risk={dashData.risk} />}
          {activeTab === "recommendations" && (
            <RecommendationsPanel
              recommendations={dashData.recommendations}
              onGenerate={handleRecommend}
              loading={loading === "recommend"}
            />
          )}
          {activeTab === "modelOps" && <ModelOpsPanel />}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub: string; color: string; icon: typeof Boxes }) {
  const colors: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
    purple: "from-sky-500/20 to-sky-600/5 border-sky-500/30 text-sky-400",
    yellow: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
    red: "from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400",
  };
  return (
    <div className={`rounded-lg border bg-gradient-to-br p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-400">{label}</p>
        <Icon size={16} aria-hidden="true" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
