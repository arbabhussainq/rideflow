import { computeZoneTravelTime } from "./cityZones";
import { DeterministicRNG } from "./randomGenerator";

export function generateCustomerDemands(passengerCount, cityConfig, seed) {
  const rng = new DeterministicRNG(seed);
  const stream = [];
  let currentClock = 1;
  const count = Math.max(1, parseInt(passengerCount, 10) || 10);
  const zones = cityConfig.zones;

  for (let i = 1; i <= count; i++) {
    // Pure textbook discrete uniform interarrival: 1 to 8 minutes
    const interarrival = rng.getInterarrival();
    if (i > 1) {
      currentClock += interarrival.value;
    }

    const origin = rng.pickZone(zones);
    let dest = rng.pickZone(zones);
    if (zones.length > 1 && dest === origin && rng.next() > 0.2) {
      dest = zones.find((z) => z.id !== origin)?.id || origin;
    }

    // Trip duration is derived directly from the physical road distance between origin and dest
    const baseTripTime = computeZoneTravelTime(cityConfig, origin, dest);
    // Add small random passenger trip variability (0 to 3 mins)
    const tripDuration = baseTripTime + (rng.getPickupDelay().value - 1);

    stream.push({
      id: `P${i}`,
      index: i,
      arrivalClock: currentClock,
      origin,
      dest,
      pickupDelay: rng.getPickupDelay().value, // 1 to 3 mins doorstep delay
      tripDuration,
      interarrival: interarrival.value,
    });
  }
  return stream;
}

export function executeSimulation({
  strategy,
  customerStream,
  cityConfig,
  driverCount = 4,
  patienceLimit = 12,
}) {
  const numDrivers = Math.max(1, parseInt(driverCount, 10) || 1);
  const zones = cityConfig.zones;

  // Distribute fleet across city zones at t=0
  const drivers = Array.from({ length: numDrivers }, (_, idx) => ({
    id: `D${idx + 1}`,
    currentZone: zones[idx % zones.length].id,
    status: "IDLE",
    availableAt: 0,
    lastIdleStart: 0,
    busyMinutes: 0,
    deadheadMinutes: 0,
    tripsCompleted: 0,
  }));

  const queue = [];
  const passengerLogs = [];
  const scheduledTrips = [];
  const pendingArrivals = customerStream.map((c) => ({ ...c }));

  let clock = 0;

  // Run until all passengers are served or abandoned, and all drivers return to idle
  while (
    pendingArrivals.length > 0 ||
    queue.length > 0 ||
    drivers.some((d) => d.status !== "IDLE")
  ) {
    const nextArrTime =
      pendingArrivals.length > 0 ? pendingArrivals[0].arrivalClock : Infinity;
    const nextDriverFreeTime = Math.min(
      ...drivers.map((d) => (d.status !== "IDLE" ? d.availableAt : Infinity)),
    );
    const nextTimeout =
      queue.length > 0 ?
        Math.min(...queue.map((p) => p.arrivalClock + patienceLimit))
      : Infinity;

    clock = Math.min(nextArrTime, nextDriverFreeTime, nextTimeout);
    if (clock === Infinity) break;

    // 1. Mark drivers who completed trips as IDLE in their dropoff zones
    for (let i = 0; i < drivers.length; i++) {
      const d = drivers[i];
      if (d.status !== "IDLE" && d.availableAt <= clock) {
        d.status = "IDLE";
        d.lastIdleStart = clock;
      }
    }

    // 2. Process customer cancellations (reneging past patience limit)
    for (let i = queue.length - 1; i >= 0; i--) {
      const p = queue[i];
      if (clock >= p.arrivalClock + patienceLimit) {
        queue.splice(i, 1);
        passengerLogs.push({
          ...p,
          assignedDriver: null,
          assignClock: null,
          queueWait: patienceLimit,
          pickupTime: 0,
          outcome: "ABANDONED",
          dropoffClock: null,
        });
      }
    }

    // 3. Process new customer booking arrivals
    while (
      pendingArrivals.length > 0 &&
      pendingArrivals[0].arrivalClock <= clock
    ) {
      queue.push(pendingArrivals.shift());
    }

    // 4. Policy-based Dispatch Assignment
    let idleDrivers = drivers.filter((d) => d.status === "IDLE");

    while (idleDrivers.length > 0 && queue.length > 0) {
      let matchedPair = null;

      if (strategy === "NEAREST") {
        const rider = queue[0];
        let bestDriver = idleDrivers[0];
        let bestDist = computeZoneTravelTime(
          cityConfig,
          bestDriver.currentZone,
          rider.origin,
        );

        for (let i = 1; i < idleDrivers.length; i++) {
          const dist = computeZoneTravelTime(
            cityConfig,
            idleDrivers[i].currentZone,
            rider.origin,
          );
          if (
            dist < bestDist ||
            (dist === bestDist &&
              idleDrivers[i].id.localeCompare(bestDriver.id) < 0)
          ) {
            bestDist = dist;
            bestDriver = idleDrivers[i];
          }
        }
        matchedPair = { riderIndex: 0, driver: bestDriver };
      } else if (strategy === "LONGEST_IDLE") {
        const rider = queue[0];
        let bestDriver = idleDrivers[0];

        for (let i = 1; i < idleDrivers.length; i++) {
          if (idleDrivers[i].lastIdleStart < bestDriver.lastIdleStart) {
            bestDriver = idleDrivers[i];
          }
        }
        matchedPair = { riderIndex: 0, driver: bestDriver };
      } else if (strategy === "ZONE_AWARE") {
        // Priority 1: Match with driver already in the same zone
        for (let i = 0; i < queue.length; i++) {
          const rider = queue[i];
          const localDriver = idleDrivers.find(
            (d) => d.currentZone === rider.origin,
          );
          if (localDriver) {
            matchedPair = { riderIndex: i, driver: localDriver };
            break;
          }
        }

        // Priority 2: Match closest driver within 10 mins; withhold cross-city drivers unless waited >= 4 mins
        if (!matchedPair) {
          for (let i = 0; i < queue.length; i++) {
            const rider = queue[i];
            const waited = clock - rider.arrivalClock;

            const candidates = idleDrivers.filter((d) => {
              const dist = computeZoneTravelTime(
                cityConfig,
                d.currentZone,
                rider.origin,
              );
              return dist <= 12 || waited >= 4;
            });

            if (candidates.length > 0) {
              candidates.sort(
                (a, b) =>
                  computeZoneTravelTime(
                    cityConfig,
                    a.currentZone,
                    rider.origin,
                  ) -
                  computeZoneTravelTime(
                    cityConfig,
                    b.currentZone,
                    rider.origin,
                  ),
              );
              matchedPair = { riderIndex: i, driver: candidates[0] };
              break;
            }
          }
        }
      }

      if (!matchedPair) break;

      const [rider] = queue.splice(matchedPair.riderIndex, 1);
      const driver = matchedPair.driver;

      const basePickup = computeZoneTravelTime(
        cityConfig,
        driver.currentZone,
        rider.origin,
      );
      const totalPickup = basePickup + rider.pickupDelay;
      const pickupEnd = clock + totalPickup;
      const dropoffEnd = pickupEnd + rider.tripDuration;
      const queueWait = clock - rider.arrivalClock;

      scheduledTrips.push({
        driverId: driver.id,
        passengerId: rider.id,
        startZone: driver.currentZone,
        pickupZone: rider.origin,
        dropZone: rider.dest,
        assignTime: clock,
        pickupTime: pickupEnd,
        dropoffTime: dropoffEnd,
      });

      driver.status = "BUSY";
      driver.availableAt = dropoffEnd;
      driver.currentZone = rider.dest; // Driver moves to dropoff zone
      driver.busyMinutes += totalPickup + rider.tripDuration;
      driver.deadheadMinutes += totalPickup;
      driver.tripsCompleted += 1;

      passengerLogs.push({
        ...rider,
        assignedDriver: driver.id,
        assignClock: clock,
        queueWait,
        basePickup,
        pickupTime: totalPickup,
        pickupClock: pickupEnd,
        dropoffClock: dropoffEnd,
        outcome: "COMPLETED",
      });

      idleDrivers = idleDrivers.filter((d) => d.id !== driver.id);
    }
  }

  const completed = passengerLogs.filter((p) => p.outcome === "COMPLETED");
  const total = customerStream.length;
  const fulfillmentRate = total > 0 ? (completed.length / total) * 100 : 0;

  const avgWait =
    completed.length > 0 ?
      completed.reduce((a, b) => a + b.queueWait, 0) / completed.length
    : 0;
  const avgPickup =
    completed.length > 0 ?
      completed.reduce((a, b) => a + b.pickupTime, 0) / completed.length
    : 0;
  const avgDelay = avgWait + avgPickup;

  const totalDeadhead = drivers.reduce((a, b) => a + b.deadheadMinutes, 0);
  const totalBusy = drivers.reduce((a, b) => a + b.busyMinutes, 0);
  const maxClock = Math.max(
    ...passengerLogs.map((p) => p.dropoffClock || p.arrivalClock),
    clock,
    1,
  );
  const utilization = (totalBusy / (numDrivers * maxClock)) * 100;

  return {
    strategy,
    passengerLogs: passengerLogs.sort((a, b) => a.index - b.index),
    scheduledTrips,
    maxClock,
    metrics: {
      totalRequests: total,
      completedCount: completed.length,
      abandonedCount: total - completed.length,
      fulfillmentRate: fulfillmentRate.toFixed(1),
      avgWait: avgWait.toFixed(2),
      avgPickup: avgPickup.toFixed(2),
      avgDelay: avgDelay.toFixed(2),
      totalDeadhead,
      utilization: Math.min(100, utilization).toFixed(1),
      simDuration: maxClock,
    },
  };
}
