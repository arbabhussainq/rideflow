import React from "react";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";

export default function PlaybackController({
  isPlaying,
  setIsPlaying,
  currentClock,
  setCurrentClock,
  maxClock,
  playbackSpeed,
  setPlaybackSpeed,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Transport Controls */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all">
          {isPlaying ?
            <Pause className="w-4 h-4 fill-current" />
          : <Play className="w-4 h-4 fill-current" />}
          <span>{isPlaying ? "Pause" : "Play Run"}</span>
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentClock(0);
          }}
          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
          title="Reset to minute 0">
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-1 text-xs font-mono rounded-lg transition-colors ${
                playbackSpeed === spd ?
                  "bg-white dark:bg-slate-700 font-bold text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}>
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="w-full sm:w-1/2 flex items-center space-x-3">
        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
          {currentClock}m
        </span>
        <input
          type="range"
          min="0"
          max={maxClock || 60}
          value={currentClock}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentClock(parseInt(e.target.value, 10));
          }}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
          {maxClock}m
        </span>
      </div>
    </div>
  );
}
