import { AlertTriangle, Bot, PackagePlus, Pause, Route, ShoppingCart } from "lucide-react";

type Rec = {
  id: number;
  warehouse: string;
  product: string;
  action: string;
  details: unknown;
  confidence: number | null;
  status: string;
  created_at: string | null;
};

const ACTION_STYLE: Record<string, { border: string; icon: typeof Route; badge: string }> = {
  "Transfer Inventory": { border: "border-blue-500/30", icon: Route, badge: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  "Procure Inventory": { border: "border-violet-500/30", icon: ShoppingCart, badge: "bg-violet-500/10 text-violet-400 border-violet-500/30" },
  "Emergency Replenishment": { border: "border-red-500/30", icon: AlertTriangle, badge: "bg-red-500/10 text-red-400 border-red-500/30" },
  "Delay Shipment": { border: "border-amber-500/30", icon: Pause, badge: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
};

function parseDetails(details: unknown): Record<string, unknown> {
  if (typeof details === "object" && details !== null) return details as Record<string, unknown>;
  if (typeof details === "string") {
    try { return JSON.parse(details); } catch { return {}; }
  }
  return {};
}

export default function RecommendationsPanel({
  recommendations,
  onGenerate,
  loading,
}: {
  recommendations: Rec[];
  onGenerate: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">AI Recommendations</h2>
          <p className="text-xs text-gray-500">Ensemble forecast + OR-Tools optimization + FAISS similarity matching</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-50 inline-flex items-center gap-2"
        >
          <PackagePlus size={15} aria-hidden="true" />
          {loading ? "Analyzing..." : "Generate Recommendations"}
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <Bot className="mx-auto mb-3 text-gray-500" size={34} aria-hidden="true" />
          <p className="text-gray-300 font-medium mb-1">No recommendations yet</p>
          <p className="text-gray-500 text-sm">Click "Generate Recommendations" to run the AI analysis pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map(rec => {
            const style = ACTION_STYLE[rec.action] ?? ACTION_STYLE["Transfer Inventory"];
            const Icon = style.icon;
            const details = parseDetails(rec.details);
            const transfers = details.transfers as Array<{ from: string; qty: number }> | undefined;
            const confidence = rec.confidence ?? 0;
            const deficit = typeof details.deficit === "number" ? details.deficit : null;
            const isUrgent = details.urgent === true;

            return (
              <div key={rec.id} className={`bg-gray-900 border rounded-xl overflow-hidden ${style.border}`}>
                {/* Card header */}
                <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={20} aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-white text-sm">{rec.action}</p>
                      <p className="text-xs text-gray-400">{rec.product} · Warehouse {rec.warehouse}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>
                    {rec.action.split(" ")[0]}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-5 py-4 space-y-3">
                  {/* Confidence bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>AI Confidence</span>
                      <span className="font-bold text-white">{(confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Deficit */}
                  {deficit !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Units Needed</span>
                      <span className="font-bold text-red-400">{deficit.toLocaleString()} units</span>
                    </div>
                  )}

                  {/* Transfer plan */}
                  {transfers && transfers.length > 0 && (
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-2 font-medium">Transfer Plan</p>
                      {transfers.map((t, i) => (
                        <div key={i} className="flex items-center justify-between text-sm mb-1 last:mb-0">
                          <span className="text-gray-300">
                            <span className="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-xs mr-1">WH-{t.from}</span>
                            → <span className="font-mono bg-indigo-900/50 px-1.5 py-0.5 rounded text-xs ml-1">WH-{rec.warehouse}</span>
                          </span>
                          <span className="font-bold text-blue-400 font-mono">{t.qty.toLocaleString()} u</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Urgent badge */}
                  {isUrgent && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400 flex items-center gap-2">
                      <AlertTriangle size={14} aria-hidden="true" />
                      <span>Emergency procurement required — stock critically low</span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Status: {rec.status}</span>
                    <span>Optimization ready</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Architecture note */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-2">
        <h4 className="text-xs font-semibold text-gray-400 mb-2">Pipeline Architecture</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {["Feature Engineering", "XGBoost (40%)", "TFT via Claude AI (60%)", "Ensemble Engine", "Risk Detection", "OR-Tools Solver", "FAISS Similarity"].map(step => (
            <span key={step} className="bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded-lg">
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
