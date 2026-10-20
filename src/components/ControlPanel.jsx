import React from "react";
import {
  SlidersHorizontal,
  MapPin,
  Users,
  Car,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default function ControlPanel({
  layoutMode,
  setLayoutMode,
  customZoneCount,
  setCustomZoneCount,
  selectedStrategy,
  setSelectedStrategy,
  passengerCount,
  setPassengerCount,
  driverCount,
  setDriverCount,
  simHorizon,
  setSimHorizon,
  patienceLimit,
  setPatienceLimit,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center space-x-2 pb-3 mb-5 border-b border-slate-100 dark:border-slate-800/80">
        <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Simulation Parameters & Dynamic Controls
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* City Layout Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>City Layout</span>
          </label>
          <select
            value={layoutMode}
            onChange={(e) => setLayoutMode(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="CORE_3">Hyderabad Core (3 Zones)</option>
            <option value="GREATER_8">Greater Hyderabad (8 Zones)</option>
            <option value="CUSTOM">Custom Sandbox (Any Zones)</option>
          </select>
        </div>

        {/* Dynamic Zone Input (Free typing for any number of zones) */}
        {layoutMode === "CUSTOM" ?
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              Total Zones (Uncapped)
            </label>
            <input
              type="number"
              min="2"
              value={customZoneCount}
              onChange={(e) =>
                setCustomZoneCount(
                  Math.max(2, parseInt(e.target.value, 10) || 2),
                )
              }
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. 15, 30..."
            />
          </div>
        : <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              Policy In Focus
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="ZONE_AWARE">Zone-Aware Tiered</option>
              <option value="NEAREST">Nearest Driver (Greedy)</option>
              <option value="LONGEST_IDLE">Longest Idle (Fairness)</option>
            </select>
          </div>
        }

        {/* Passengers Input (Free typing, no upper limit) */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5 flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Total Passengers</span>
          </label>
          <input
            type="number"
            min="1"
            value={passengerCount}
            onChange={(e) =>
              setPassengerCount(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="e.g. 50, 200..."
          />
        </div>

        {/* Fleet Size Input (Free typing, no upper limit) */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5 flex items-center space-x-1">
            <Car className="w-3.5 h-3.5 text-blue-500" />
            <span>Fleet Drivers</span>
          </label>
          <input
            type="number"
            min="1"
            value={driverCount}
            onChange={(e) =>
              setDriverCount(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="e.g. 10, 40..."
          />
        </div>

        {/* Simulation Horizon (Free typing, in minutes) */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Horizon (Minutes)</span>
          </label>
          <input
            type="number"
            min="10"
            step="10"
            value={simHorizon}
            onChange={(e) =>
              setSimHorizon(Math.max(10, parseInt(e.target.value, 10) || 10))
            }
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="e.g. 120, 480..."
          />
        </div>

        {/* Patience Timeout (Free typing, in minutes) */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5 flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
            <span>Patience (Mins)</span>
          </label>
          <input
            type="number"
            min="1"
            value={patienceLimit}
            onChange={(e) =>
              setPatienceLimit(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="e.g. 10..."
          />
        </div>
      </div>
    </div>
  );
}
