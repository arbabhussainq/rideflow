import React from "react";
import { Sun, Moon, Navigation, RefreshCw } from "lucide-react";

export default function Header({ darkMode, setDarkMode, seed, setSeed }) {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Navigation className="w-5 h-5 fill-current" />
        </div>
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              RideFlow
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Operations Lab
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Discrete-Event Urban Fleet Simulation · Comparative Dispatch Policy
            Benchmarking
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSeed(Math.floor(Math.random() * 900000) + 100000)}
          className="flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
          <span>Reseed #{seed}</span>
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Theme"
          className="p-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          {darkMode ?
            <Sun className="w-4 h-4" />
          : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
