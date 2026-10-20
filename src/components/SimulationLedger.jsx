import React from "react";
import { Download } from "lucide-react";

export default function SimulationLedger({ logs, activeStrategy }) {
  if (!logs || logs.length === 0) return null;

  const exportCSV = () => {
    const headers = [
      "Customer",
      "Arr_Clock",
      "Route",
      "Driver",
      "Queue_Wait",
      "Pickup_Transit",
      "Dropoff_Clock",
      "Outcome",
    ];
    const rows = logs.map((p) => [
      p.id,
      p.arrivalClock,
      `${p.origin}->${p.dest}`,
      p.assignedDriver || "None",
      p.queueWait,
      p.pickupTime,
      p.dropoffClock || "N/A",
      p.outcome,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `simulation_table_${activeStrategy.toLowerCase()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 font-bold">
            Customer Simulation Ledger · Table 2.14 Format
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Traceable Event Sequence under {activeStrategy.replace("_", " ")}{" "}
            Policy
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <Download className="w-3.5 h-3.5 text-blue-500" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto max-h-[340px]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Rider</th>
              <th className="py-3 px-4">Arr Clock</th>
              <th className="py-3 px-4">Trip Route</th>
              <th className="py-3 px-4">Driver</th>
              <th className="py-3 px-4">Queue Wait</th>
              <th className="py-3 px-4">Pickup Transit</th>
              <th className="py-3 px-4">Dropoff Clock</th>
              <th className="py-3 px-4">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
            {logs.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                  {row.id}
                </td>
                <td className="py-2.5 px-4">{row.arrivalClock}m</td>
                <td className="py-2.5 px-4 font-sans font-medium text-slate-500 dark:text-slate-400">
                  {row.origin} → {row.dest}
                </td>
                <td className="py-2.5 px-4">
                  {row.assignedDriver ?
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                      {row.assignedDriver}
                    </span>
                  : <span className="text-slate-400">—</span>}
                </td>
                <td className="py-2.5 px-4">{row.queueWait}m</td>
                <td className="py-2.5 px-4">
                  {row.pickupTime ? `${row.pickupTime}m` : "—"}
                </td>
                <td className="py-2.5 px-4">
                  {row.dropoffClock ? `${row.dropoffClock}m` : "—"}
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      row.outcome === "COMPLETED" ?
                        "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                    }`}>
                    {row.outcome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
