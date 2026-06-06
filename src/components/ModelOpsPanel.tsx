import {
  Boxes,
  BrainCircuit,
  Database,
  GitBranch,
  LineChart,
  Network,
  Route,
  Search,
  ServerCog,
  SlidersHorizontal,
} from "lucide-react";

const concepts = [
  {
    title: "Time Series Forecasting",
    body: "Sales history is transformed into lag, rolling average, trend, and calendar signals before demand is predicted.",
    icon: LineChart,
  },
  {
    title: "Deep Learning TFT",
    body: "The live app uses an AI temporal forecaster, while the Python workspace includes a compact gated sequence model inspired by TFT behavior.",
    icon: BrainCircuit,
  },
  {
    title: "XGBoost",
    body: "A tabular model scores stock, returns, lead time, promotions, and recent demand features with feature importance output.",
    icon: GitBranch,
  },
  {
    title: "Recommendation Systems",
    body: "Risk items are converted into transfer, procurement, or emergency replenishment recommendations.",
    icon: Route,
  },
  {
    title: "Optimization",
    body: "Transfer quantities are capped to preserve source buffers while covering deficits at high-risk destinations.",
    icon: SlidersHorizontal,
  },
  {
    title: "Vector Search FAISS",
    body: "The Python training script builds a FAISS similarity index for retrieving comparable inventory states.",
    icon: Search,
  },
  {
    title: "Supply Chain Analytics",
    body: "Risk scores combine stock, seven-day forecast demand, safety stock, and days remaining.",
    icon: Boxes,
  },
  {
    title: "Enterprise Backend",
    body: "TanStack Server Functions expose dashboard actions while server-only modules own forecasting, risk, and recommendation logic.",
    icon: ServerCog,
  },
  {
    title: "Database Design",
    body: "Netlify Database and Drizzle model sales, inventory, returns, transfers, forecasts, and recommendations as relational tables.",
    icon: Database,
  },
  {
    title: "Dashboard Engineering",
    body: "Tabbed React panels keep operational views focused for planners reviewing stock, forecasts, risks, flows, and actions.",
    icon: Network,
  },
];

const files = [
  "ml/data/inventory_training_sample.csv",
  "ml/train_inventory_models.py",
  "ml/requirements.txt",
  "ml/README.md",
];

export default function ModelOpsPanel() {
  return (
    <div className="space-y-5">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <p className="text-xs uppercase tracking-wide text-cyan-400 mb-2">Explainable training layer</p>
        <h2 className="text-lg font-semibold text-white">Forecasting, search, and optimization workflow</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-3xl">
          The application remains a Netlify-backed dashboard, and the new Python workspace gives reviewers a clear,
          reproducible path for training demand models, inspecting drivers, building a FAISS index, and validating
          recommendation logic outside the web runtime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {concepts.map(({ title, body, icon: Icon }) => (
          <div key={title} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs leading-5 text-gray-400 mt-1">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Training Files Added</h3>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file} className="font-mono text-xs text-gray-300 bg-gray-950 border border-gray-800 rounded-md px-3 py-2">
                {file}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Human Review Output</h3>
          <p className="text-sm text-gray-400 leading-6">
            Running the Python script produces a JSON report with model error, top XGBoost feature drivers, FAISS index
            shape, optimization objective, and generated recommendations. This makes model behavior easier to inspect
            before it is promoted into the enterprise backend.
          </p>
        </div>
      </div>
    </div>
  );
}
