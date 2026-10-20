import React from "react";
import { Trophy, ArrowUpRight } from "lucide-react";

export default function StrategyComparison({
  results,
  activeStrategy,
  setActiveStrategy,
}) {
  if (!results || results.length === 0) return null;

  // Determine top-performing strategy by lowest customer delay
  const lowestDelay = Math.min(
    ...results.map((r) => parseFloat(r.metrics.avgDelay)),
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Strategy Benchmark
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identical Customer Trace Replayed Across All 3 Policies
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
          N = {results[0].metrics.totalRequests}
        </span>
      </div>

      <div className="space-y-3.5">
        {results.map((res) => {
          const isWinner = parseFloat(res.metrics.avgDelay) === lowestDelay;
          const isSelected = res.strategy === activeStrategy;

          return (
            <div
              key={res.strategy}
              onClick={() => setActiveStrategy(res.strategy)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected ?
                  "bg-blue-50/60 dark:bg-blue-950/20 border-blue-500 shadow-sm"
                : "bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {res.strategy.replace("_", " ")}
                </span>
                {isWinner && (
                  <span className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-semibold rounded-full border border-blue-200 dark:border-blue-800">
                    <Trophy className="w-3 h-3 text-blue-600" />
                    <span>Optimal</span>
                  </span>
                )}
              </div>

              {/* Clean Metric Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Fulfill
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {res.metrics.fulfillmentRate}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Avg Delay
                  </span>
                  <span
                    className={`font-semibold ${isWinner ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>
                    {res.metrics.avgDelay}m
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Deadhead
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {res.metrics.totalDeadhead}m
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 text-center">
        Click any strategy card to switch the visualizer and ledger table.
      </div>
    </div>
  );
}
