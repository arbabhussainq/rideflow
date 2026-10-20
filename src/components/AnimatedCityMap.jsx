import React from "react";
import { Car, Navigation, UserCheck } from "lucide-react";

export default function AnimatedCityMap({
  cityConfig,
  activeRun,
  currentClock,
}) {
  const { zones } = cityConfig;

  // Calculate live position of every driver at current simulation minute
  const driverPositions = [];
  if (activeRun && activeRun.scheduledTrips) {
    const activeTrips = activeRun.scheduledTrips;

    // Build unique driver list
    const driverIds = Array.from(new Set(activeTrips.map((t) => t.driverId)));

    driverIds.forEach((dId) => {
      // Find trip where current clock lies within [assignTime, dropoffTime]
      const currentTrip = activeTrips.find(
        (t) =>
          t.driverId === dId &&
          currentClock >= t.assignTime &&
          currentClock <= t.dropoffTime,
      );

      if (currentTrip) {
        const fromZ =
          zones.find((z) => z.id === currentTrip.startZone) || zones[0];
        const pickZ =
          zones.find((z) => z.id === currentTrip.pickupZone) || zones[0];
        const destZ =
          zones.find((z) => z.id === currentTrip.dropZone) || zones[0];

        let posX = fromZ.x;
        let posY = fromZ.y;
        let phase = "DISPATCH"; // DISPATCH or ON_TRIP

        if (currentClock < currentTrip.pickupTime) {
          // En route to pickup
          phase = "PICKUP_TRANSIT";
          const progress = Math.max(
            0,
            Math.min(
              1,
              (currentClock - currentTrip.assignTime) /
                (currentTrip.pickupTime - currentTrip.assignTime || 1),
            ),
          );
          posX = fromZ.x + (pickZ.x - fromZ.x) * progress;
          posY = fromZ.y + (pickZ.y - fromZ.y) * progress;
        } else {
          // Carrying passenger to destination
          phase = "ON_TRIP";
          const progress = Math.max(
            0,
            Math.min(
              1,
              (currentClock - currentTrip.pickupTime) /
                (currentTrip.dropoffTime - currentTrip.pickupTime || 1),
            ),
          );
          posX = pickZ.x + (destZ.x - pickZ.x) * progress;
          posY = pickZ.y + (destZ.y - pickZ.y) * progress;
        }

        driverPositions.push({
          id: dId,
          x: posX,
          y: posY,
          phase,
          trip: currentTrip,
        });
      } else {
        // Driver is idle at their last dropped zone or home zone
        const lastFinished = activeTrips
          .filter((t) => t.driverId === dId && t.dropoffTime < currentClock)
          .sort((a, b) => b.dropoffTime - a.dropoffTime)[0];

        const zoneId =
          lastFinished ?
            lastFinished.dropZone
          : zones[parseInt(dId.replace("D", ""), 10) % zones.length]?.id;
        const targetZone = zones.find((z) => z.id === zoneId) || zones[0];
        driverPositions.push({
          id: dId,
          x: targetZone.x,
          y: targetZone.y,
          phase: "IDLE",
        });
      }
    });
  }

  return (
    <div className="relative w-full h-[460px] bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
      {/* City Status Overlay */}
      <div className="absolute top-4 left-5 z-10 flex items-center space-x-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 backdrop-blur">
          {cityConfig.name} · Spatial Grid
        </span>
      </div>

      <svg className="w-full h-full select-none" viewBox="0 0 700 460">
        <defs>
          <linearGradient
            id="riverGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Indus River (Sindh Darya) curve for Hyderabad */}
        {cityConfig.id.includes("HYDERABAD") || cityConfig.id.includes("CORE") ?
          <g>
            <path
              d="M 60,0 C 90,140 130,230 110,360 C 100,410 70,440 50,460"
              fill="none"
              stroke="url(#riverGradient)"
              strokeWidth="32"
              strokeLinecap="round"
            />
            <text
              x="65"
              y="320"
              className="text-[10px] font-mono fill-sky-600/70 dark:fill-sky-400/50 font-semibold tracking-widest rotate-[-75]">
              INDUS RIVER (SINDH DARYA)
            </text>
          </g>
        : null}

        {/* Road Links Between Zones */}
        {zones.map((z1, i) =>
          zones
            .slice(i + 1)
            .map((z2) => (
              <line
                key={`${z1.id}-${z2.id}`}
                x1={z1.x}
                y1={z1.y}
                x2={z2.x}
                y2={z2.y}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-800 transition-colors"
                strokeWidth="2"
                strokeDasharray="4 6"
              />
            )),
        )}

        {/* Zone Hub Nodes */}
        {zones.map((zone) => (
          <g key={zone.id} className="transition-all duration-300">
            {/* Outer Zone Aura */}
            <circle
              cx={zone.x}
              cy={zone.y}
              r="38"
              className="fill-white dark:fill-slate-850 stroke-slate-200 dark:stroke-slate-700 transition-all hover:stroke-blue-500"
              strokeWidth="2"
            />
            {/* Center Pin */}
            <circle
              cx={zone.x}
              cy={zone.y}
              r="5"
              className="fill-blue-600 dark:fill-blue-400"
            />
            {/* Zone Name Label */}
            <text
              x={zone.x}
              y={zone.y - 46}
              textAnchor="middle"
              className="text-xs font-sans font-bold fill-slate-800 dark:fill-slate-100">
              {zone.name}
            </text>
            <text
              x={zone.x}
              y={zone.y + 54}
              textAnchor="middle"
              className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 uppercase tracking-wider">
              Zone {zone.code || zone.id}
            </text>
          </g>
        ))}

        {/* Animated Moving Driver Tokens */}
        {driverPositions.map((driver) => {
          const isBusy = driver.phase !== "IDLE";
          const isEnRoute = driver.phase === "PICKUP_TRANSIT";
          const isOnTrip = driver.phase === "ON_TRIP";

          return (
            <g
              key={driver.id}
              transform={`translate(${driver.x}, ${driver.y})`}
              className="transition-transform duration-300 ease-linear">
              {/* Pulsing ring for active driver */}
              {isBusy && (
                <circle
                  r="18"
                  className={
                    isOnTrip ?
                      "fill-blue-500/20 stroke-blue-500 animate-ping"
                    : "fill-amber-500/20 stroke-amber-500"
                  }
                  strokeWidth="1.5"
                />
              )}
              {/* Vehicle Pill */}
              <rect
                x="-16"
                y="-16"
                width="32"
                height="32"
                rx="8"
                className={`shadow-md ${
                  isOnTrip ? "fill-blue-600 stroke-blue-400"
                  : isEnRoute ? "fill-amber-500 stroke-amber-300"
                  : "fill-slate-800 dark:fill-slate-700 stroke-slate-600"
                }`}
                strokeWidth="2"
              />
              <Car className="w-4 h-4 text-white -translate-x-2 -translate-y-2 pointer-events-none" />

              {/* Driver ID Tag */}
              <text
                x="0"
                y="26"
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-slate-900 dark:fill-white bg-white">
                {driver.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Map Legend */}
      <div className="p-3 bg-white/90 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 backdrop-blur flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-700" />
            <span>Driver Idle</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500" />
            <span>Pickup Transit</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-600" />
            <span>On Passenger Trip</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          Clock:{" "}
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {currentClock} mins
          </span>
        </div>
      </div>
    </div>
  );
}
