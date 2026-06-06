type Transfer = {
  id: number;
  from_warehouse: string;
  to_warehouse: string;
  product: string;
  quantity: number;
  status: string;
};

type RiskItem = {
  warehouse: string;
  product: string;
  risk: string;
  stock: number;
  daysRemaining: number;
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  in_transit: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  pending: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

const WAREHOUSES = ["A", "B", "C", "D"];
const WH_POS: Record<string, { x: number; y: number }> = {
  A: { x: 50, y: 50 },
  B: { x: 350, y: 50 },
  C: { x: 50, y: 250 },
  D: { x: 350, y: 250 },
};

const RISK_NODE: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f59e0b",
  MEDIUM: "#eab308",
  LOW: "#10b981",
};

export default function TransferMap({
  transfers,
  risk,
}: {
  transfers: Transfer[];
  risk: RiskItem[];
}) {
  // Determine worst risk per warehouse
  const whRisk: Record<string, string> = {};
  for (const wh of WAREHOUSES) {
    const items = risk.filter(r => r.warehouse === wh);
    whRisk[wh] = items.some(r => r.risk === "CRITICAL") ? "CRITICAL"
      : items.some(r => r.risk === "HIGH") ? "HIGH"
      : items.some(r => r.risk === "MEDIUM") ? "MEDIUM" : "LOW";
  }

  const whStock: Record<string, number> = {};
  for (const wh of WAREHOUSES) {
    whStock[wh] = risk.filter(r => r.warehouse === wh).reduce((s, r) => s + r.stock, 0);
  }

  return (
    <div className="space-y-6">
      {/* SVG Transfer Map */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Warehouse Network · Transfer Flow</h3>
        <div className="flex justify-center">
          <svg viewBox="0 0 420 320" className="w-full max-w-lg" style={{ height: 300 }}>
            {/* Draw transfer arrows */}
            {transfers.map((t, i) => {
              const from = WH_POS[t.from_warehouse];
              const to = WH_POS[t.to_warehouse];
              if (!from || !to) return null;
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const color = t.status === "completed" ? "#10b981" : t.status === "in_transit" ? "#3b82f6" : "#f59e0b";
              return (
                <g key={i}>
                  <line
                    x1={from.x + 40} y1={from.y + 40}
                    x2={to.x + 40} y2={to.y + 40}
                    stroke={color}
                    strokeWidth={2.5}
                    strokeDasharray={t.status === "in_transit" ? "6,3" : "none"}
                    opacity={0.7}
                    markerEnd={`url(#arrow-${i})`}
                  />
                  <defs>
                    <marker id={`arrow-${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill={color} />
                    </marker>
                  </defs>
                  <text x={midX + 40} y={midY + 35} textAnchor="middle" fill={color} fontSize={10} fontWeight="bold">
                    {t.quantity}u
                  </text>
                </g>
              );
            })}

            {/* Draw warehouse nodes */}
            {WAREHOUSES.map(wh => {
              const pos = WH_POS[wh];
              const riskColor = RISK_NODE[whRisk[wh]];
              const stock = whStock[wh];
              return (
                <g key={wh}>
                  <rect x={pos.x} y={pos.y} width={80} height={80} rx={12} fill="#1f2937" stroke={riskColor} strokeWidth={2} />
                  <circle cx={pos.x + 72} cy={pos.y + 8} r={6} fill={riskColor} />
                  <text x={pos.x + 40} y={pos.y + 32} textAnchor="middle" fill="white" fontSize={18} fontWeight="bold">
                    {wh}
                  </text>
                  <text x={pos.x + 40} y={pos.y + 50} textAnchor="middle" fill="#9ca3af" fontSize={9}>
                    {stock.toLocaleString()} units
                  </text>
                  <text x={pos.x + 40} y={pos.y + 64} textAnchor="middle" fill={riskColor} fontSize={9} fontWeight="bold">
                    {whRisk[wh]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Transfer log */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300">Transfer Log</h3>
        </div>
        {transfers.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No transfers recorded. Seed data to populate.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left px-5 py-2">Product</th>
                <th className="text-center px-4 py-2">From</th>
                <th className="text-center px-4 py-2">To</th>
                <th className="text-right px-4 py-2">Quantity</th>
                <th className="text-center px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(t => (
                <tr key={t.id} className="border-b border-gray-800/40 hover:bg-gray-800/30 transition">
                  <td className="px-5 py-3 text-gray-200">{t.product}</td>
                  <td className="text-center px-4 py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800 text-gray-300 font-bold text-xs">
                      {t.from_warehouse}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-900/50 text-indigo-300 font-bold text-xs">
                      {t.to_warehouse}
                    </span>
                  </td>
                  <td className="text-right px-4 py-3 font-mono text-white">{t.quantity.toLocaleString()}</td>
                  <td className="text-center px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[t.status] ?? "text-gray-400 border-gray-700"}`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
