import React from "react";
import { Award } from "lucide-react";

export default function ComparisonChart({ results }) {
  if (!results || results.length === 0) return null;

  const strategies = [
    { key: "NEAREST", label: "Nearest Driver (Greedy)" },
    { key: "LONGEST_IDLE", label: "Longest Idle (Fairness)" },
    { key: "ZONE_AWARE", label: "Zone-Aware Tiered" },
  ];

  // Find lowest total delay to highlight winner
  const lowestDelay = Math.min(
    ...results.map((r) => parseFloat(r.metrics.avgTotalDelay)),
  );

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-800">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Automated Strategy Benchmark
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Identical Customer Trace Replayed Across All 3 Policies
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-dark-800 text-slate-300 rounded-md border border-dark-700">
          N = {results[0].metrics.totalRequests} Requests
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map((res) => {
          const isWinner =
            parseFloat(res.metrics.avgTotalDelay) === lowestDelay;
          return (
            <div
              key={res.strategy}
              className={`p-4 rounded-xl border relative transition-all ${
                isWinner ?
                  "bg-emerald-950/20 border-emerald-500/40"
                : "bg-dark-850/60 border-dark-800"
              }`}>
              {isWinner && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium rounded-full border border-emerald-500/30">
                  <Award className="w-3 h-3" />
                  <span>Optimal Policy</span>
                </div>
              )}
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                {res.strategy.replace("_", " ")}
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Fulfillment:</span>
                  <span className="font-semibold text-white">
                    {res.metrics.fulfillmentRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Avg Customer Delay:</span>
                  <span
                    className={`font-semibold ${isWinner ? "text-emerald-400" : "text-slate-200"}`}>
                    {res.metrics.avgTotalDelay} mins
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Deadhead Waste:</span>
                  <span className="text-slate-200">
                    {res.metrics.totalDeadhead} mins
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Fleet Utilization:</span>
                  <span className="text-slate-200">
                    {res.metrics.fleetUtilization}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
