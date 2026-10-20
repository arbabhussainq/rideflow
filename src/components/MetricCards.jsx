import React from "react";
import { CheckCircle2, Clock, Zap, Fuel } from "lucide-react";

export default function MetricCards({ metrics, strategyName }) {
  if (!metrics) return null;

  const cards = [
    {
      title: "Fulfillment Rate",
      value: `${metrics.fulfillmentRate}%`,
      sub: `${metrics.completedCount} of ${metrics.totalRequests} rides completed`,
      icon: CheckCircle2,
      badge: "Platform Health",
    },
    {
      title: "Avg Customer Delay",
      value: `${metrics.avgDelay}m`,
      sub: `Wait in Queue (${metrics.avgWait}m) + Pickup (${metrics.avgPickup}m)`,
      icon: Clock,
      badge: "Rider Experience",
    },
    {
      title: "Deadhead Fuel Waste",
      value: `${metrics.totalDeadhead} min`,
      sub: "Unpaid empty pickup driving minutes",
      icon: Fuel,
      badge: "Fleet Efficiency",
    },
    {
      title: "Fleet Utilization",
      value: `${metrics.utilization}%`,
      sub: `Over ${metrics.simDuration}m operational horizon`,
      icon: Zap,
      badge: "Driver Productivity",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-500">
              {c.title}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <c.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5 font-sans">
            {c.value}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            {c.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
