type RiskItem = {
  warehouse: string;
  product: string;
  stock: number;
  forecast7d: number;
  remaining: number;
  daysRemaining: number;
  safetyStock: number;
  risk: string;
};

const RISK_BG: Record<string, string> = {
  CRITICAL: "bg-red-500/20 border-red-500/50 text-red-300",
  HIGH: "bg-amber-500/20 border-amber-500/50 text-amber-300",
  MEDIUM: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
  LOW: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
};

const RISK_DOT: Record<string, string> = {
  CRITICAL: "bg-red-500 animate-pulse",
  HIGH: "bg-amber-500",
  MEDIUM: "bg-yellow-400",
  LOW: "bg-emerald-500",
};

const PRODUCTS = ["Mobile Phone", "Laptop", "Tablet", "Headphones", "Smart Watch"];
const WAREHOUSES = ["A", "B", "C", "D"];

export default function RiskHeatmap({ risk }: { risk: RiskItem[] }) {
  const getItem = (wh: string, prod: string) =>
    risk.find(r => r.warehouse === wh && r.product === prod);

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(r => (
          <div key={r} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${RISK_DOT[r]}`} />
            <span className="text-gray-400">{r}</span>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-normal">Product / Warehouse</th>
                {WAREHOUSES.map(wh => (
                  <th key={wh} className="text-center px-4 py-3 text-gray-400 font-medium">
                    WH-{wh}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map(prod => (
                <tr key={prod} className="border-b border-gray-800/50">
                  <td className="px-5 py-4 text-gray-300 font-medium text-sm">{prod}</td>
                  {WAREHOUSES.map(wh => {
                    const item = getItem(wh, prod);
                    if (!item) return <td key={wh} className="px-4 py-4 text-center text-gray-600">—</td>;
                    return (
                      <td key={wh} className="px-4 py-4">
                        <div className={`rounded-lg border p-3 text-center ${RISK_BG[item.risk]}`}>
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <div className={`w-2 h-2 rounded-full ${RISK_DOT[item.risk]}`} />
                            <span className="text-xs font-semibold">{item.risk}</span>
                          </div>
                          <p className="text-lg font-bold text-white">{item.stock.toLocaleString()}</p>
                          <p className="text-xs opacity-70">stock</p>
                          <div className="mt-1.5 pt-1.5 border-t border-current/20 text-xs">
                            <span className="opacity-80">{item.daysRemaining}d left</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary cards for critical/high */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Action Required</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {risk
            .filter(r => r.risk === "CRITICAL" || r.risk === "HIGH")
            .sort((a, b) => (a.risk === "CRITICAL" ? -1 : 1))
            .map(item => (
              <div key={`${item.warehouse}-${item.product}`} className={`rounded-xl border p-4 ${RISK_BG[item.risk]}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white text-sm">{item.product}</p>
                    <p className="text-xs opacity-70">Warehouse {item.warehouse}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border font-bold ${item.risk === "CRITICAL" ? "border-red-500 bg-red-500/20" : "border-amber-500 bg-amber-500/20"}`}>
                    {item.risk}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                  <div>
                    <p className="opacity-60">Current Stock</p>
                    <p className="font-bold text-white text-sm">{item.stock.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="opacity-60">7d Demand</p>
                    <p className="font-bold text-white text-sm">{item.forecast7d.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Days Left</p>
                    <p className="font-bold text-white text-sm">{item.daysRemaining}d</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1 opacity-70">
                    <span>Stock vs Safety ({item.safetyStock})</span>
                    <span>{Math.round((item.stock / (item.safetyStock * 2)) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-black/30 rounded-full">
                    <div
                      className={`h-1.5 rounded-full ${item.risk === "CRITICAL" ? "bg-red-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(Math.round((item.stock / (item.safetyStock * 2)) * 100), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
