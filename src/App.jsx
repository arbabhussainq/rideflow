import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import AnimatedCityMap from "./components/AnimatedCityMap";
import PlaybackController from "./components/PlaybackController";
import MetricCards from "./components/MetricCards";
import StrategyComparison from "./components/StrategyComparison";
import SimulationLedger from "./components/SimulationLedger";
import { HYDERABAD_CONFIGS, generateCustomZones } from "./engine/cityZones";
import {
  generateCustomerDemands,
  executeSimulation,
} from "./engine/simulationEngine";

export default function App() {
  // Theme State
  const [darkMode, setDarkMode] = useState(true);

  // Simulation Parameters
  const [layoutMode, setLayoutMode] = useState("CORE_3");
  const [customZoneCount, setCustomZoneCount] = useState(4);
  const [selectedStrategy, setSelectedStrategy] = useState("ZONE_AWARE");
  const [passengerCount, setPassengerCount] = useState(15);
  const [driverCount, setDriverCount] = useState(4);
  const [simHorizon, setSimHorizon] = useState(120);
  const [patienceLimit, setPatienceLimit] = useState(10);
  const [seed, setSeed] = useState(42);

  // Playback Animation State
  const [currentClock, setCurrentClock] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Compute active city topology
  const activeCityConfig = useMemo(() => {
    if (layoutMode === "CUSTOM") {
      return generateCustomZones(customZoneCount);
    }
    return HYDERABAD_CONFIGS[layoutMode] || HYDERABAD_CONFIGS.CORE_3;
  }, [layoutMode, customZoneCount]);

  // Execute Simulation Runs across all 3 policies
  const { results, activeRun } = useMemo(() => {
    const customerStream = generateCustomerDemands(
      passengerCount,
      activeCityConfig,
      seed,
    );

    const nearestRes = executeSimulation({
      strategy: "NEAREST",
      customerStream,
      cityConfig: activeCityConfig,
      driverCount,
      patienceLimit,
    });

    const longestIdleRes = executeSimulation({
      strategy: "LONGEST_IDLE",
      customerStream,
      cityConfig: activeCityConfig,
      driverCount,
      patienceLimit,
    });

    const zoneAwareRes = executeSimulation({
      strategy: "ZONE_AWARE",
      customerStream,
      cityConfig: activeCityConfig,
      driverCount,
      patienceLimit,
    });

    const all = [nearestRes, longestIdleRes, zoneAwareRes];
    const current = all.find((r) => r.strategy === selectedStrategy) || all[0];

    return { results: all, activeRun: current };
  }, [
    passengerCount,
    activeCityConfig,
    seed,
    simHorizon,
    driverCount,
    patienceLimit,
    selectedStrategy,
  ]);

  // Animation Playback Interval
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentClock((prev) => {
          if (prev >= activeRun.maxClock) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, activeRun.maxClock]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          seed={seed}
          setSeed={setSeed}
        />

        {/* Dynamic Sandbox Controls */}
        <ControlPanel
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
          customZoneCount={customZoneCount}
          setCustomZoneCount={setCustomZoneCount}
          selectedStrategy={selectedStrategy}
          setSelectedStrategy={setSelectedStrategy}
          passengerCount={passengerCount}
          setPassengerCount={setPassengerCount}
          driverCount={driverCount}
          setDriverCount={setDriverCount}
          simHorizon={simHorizon}
          setSimHorizon={setSimHorizon}
          patienceLimit={patienceLimit}
          setPatienceLimit={setPatienceLimit}
        />

        {/* Primary Simulation Map & Comparative Side-by-Side View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            <AnimatedCityMap
              cityConfig={activeCityConfig}
              activeRun={activeRun}
              currentClock={currentClock}
            />
            <PlaybackController
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              currentClock={currentClock}
              setCurrentClock={setCurrentClock}
              maxClock={activeRun.maxClock}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
            />
          </div>

          <div className="h-full">
            <StrategyComparison
              results={results}
              activeStrategy={selectedStrategy}
              setActiveStrategy={setSelectedStrategy}
            />
          </div>
        </div>

        {/* Detailed KPI Metric Cards */}
        <MetricCards
          metrics={activeRun.metrics}
          strategyName={selectedStrategy}
        />

        {/* Traceable Course Event Ledger */}
        <SimulationLedger
          logs={activeRun.passengerLogs}
          activeStrategy={selectedStrategy}
        />
      </div>
    </div>
  );
}
