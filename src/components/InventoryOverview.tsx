type DashData = {
  summary: { totalStock: number; criticalCount: number; highCount: number; totalWarehouses: number; totalProducts: number };
  inventory: Array<{ id: number; warehouse: string; product: string; stock: number; capacity: number }>;
  risk: Array<{ warehouse: string; product: string; stock: number; forecast7d: number; remaining: number; daysRemaining: number; risk: string }>;
  salesAggregated: Array<{ warehouse: string; product: string; total_sold: number; avg_daily: number; recent_7d: number; recent_30d: number }>;
  transfers: Array<{ id: number; from_warehouse: string; to_warehouse: string; product: string; quantity: number; status: string }>;
  recommendations: Array<unknown>;
  forecasts: Array<unknown>;
};

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-500/10 border-red-500/30",
  HIGH: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  LOW: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
};

export default function InventoryOverview({ data }: { data: DashData }) {
  const products = ["Mobile Phone", "Laptop", "Tablet", "Headphones", "Smart Watch"];
  const warehouses = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      {/* Inventory grid per warehouse */}
      {warehouses.map(wh => {
        const whItems = data.inventory.filter(i => i.warehouse === wh);
        const whRisk = data.risk.filter(r => r.warehouse === wh);
        const worstRisk = whRisk.some(r => r.risk === "CRITICAL") ? "CRITICAL"
          : whRisk.some(r => r.risk === "HIGH") ? "HIGH"
          : whRisk.some(r => r.risk === "MEDIUM") ? "MEDIUM" : "LOW";

        return (
          <div key={wh} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-indigo-400">
                  {wh}
                </div>
                <h3 className="font-semibold text-white">Warehouse {wh}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${RISK_COLORS[worstRisk]}`}>
                {worstRisk}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800">
                    <th className="text-left px-5 py-2">Product</th>
                    <th className="text-right px-4 py-2">Stock</th>
                    <th className="text-right px-4 py-2">Capacity</th>
                    <th className="text-right px-4 py-2">7d Forecast</th>
                    <th className="text-right px-4 py-2">Days Left</th>
                    <th className="text-right px-4 py-2">Avg Daily</th>
                    <th className="text-center px-4 py-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => {
                    const inv = whItems.find(i => i.product === prod);
                    const risk = whRisk.find(r => r.product === prod);
                    const agg = data.salesAggregated.find(s => s.warehouse === wh && s.product === prod);
                    if (!inv) return null;
                    const fillPct = Math.round((inv.stock / inv.capacity) * 100);
                    return (
                      <tr key={prod} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                        <td className="px-5 py-3 font-medium text-gray-200">{prod}</td>
                        <td className="text-right px-4 py-3 text-white font-mono">{inv.stock.toLocaleString()}</td>
                        <td className="text-right px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-800 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${fillPct < 20 ? "bg-red-500" : fillPct < 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min(fillPct, 100)}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-xs w-10 text-right">{fillPct}%</span>
                          </div>
                        </td>
                        <td className="text-right px-4 py-3 text-gray-300 font-mono">{risk?.forecast7d.toLocaleString() ?? "—"}</td>
                        <td className="text-right px-4 py-3">
                          <span className={`font-mono font-medium ${(risk?.daysRemaining ?? 99) < 7 ? "text-red-400" : (risk?.daysRemaining ?? 99) < 14 ? "text-amber-400" : "text-gray-300"}`}>
                            {risk?.daysRemaining ?? "—"}d
                          </span>
                        </td>
                        <td className="text-right px-4 py-3 text-gray-400 font-mono">
                          {agg ? Number(agg.avg_daily).toFixed(0) : "—"}
                        </td>
                        <td className="text-center px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${RISK_COLORS[risk?.risk ?? "LOW"]}`}>
                            {risk?.risk ?? "LOW"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
