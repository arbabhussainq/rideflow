export const HYDERABAD_CONFIGS = {
  CORE_3: {
    id: "CORE_3",
    name: "Hyderabad Core (3 Zones)",
    type: "preset",
    zones: [
      {
        id: "Z1",
        name: "Qasimabad",
        code: "QSB",
        x: 190,
        y: 150,
        description: "Prince Town, Sheedi Goth Cluster",
      },
      {
        id: "Z2",
        name: "Saddar / Cantt",
        code: "SDR",
        x: 420,
        y: 230,
        description: "Commercial Core, Cantonment",
      },
      {
        id: "Z3",
        name: "Latifabad",
        code: "LTF",
        x: 330,
        y: 390,
        description: "Units 1-12 Dense Suburban",
      },
    ],
    // Calibrated real-world driving times in minutes
    matrix: {
      Z1: { Z1: 4, Z2: 14, Z3: 24 }, // QSB -> QSB (4m), QSB -> SDR (14m), QSB -> LTF (24m)
      Z2: { Z1: 14, Z2: 4, Z3: 12 }, // SDR -> QSB (14m), SDR -> SDR (4m), SDR -> LTF (12m)
      Z3: { Z1: 24, Z2: 12, Z3: 4 }, // LTF -> QSB (24m), LTF -> SDR (12m), LTF -> LTF (4m)
    },
  },
  GREATER_8: {
    id: "GREATER_8",
    name: "Greater Hyderabad (8 Zones)",
    type: "preset",
    zones: [
      { id: "Z1", name: "Qasimabad", code: "QSB", x: 210, y: 160 },
      { id: "Z2", name: "Saddar", code: "SDR", x: 410, y: 220 },
      { id: "Z3", name: "Old City / Shahi", code: "OLD", x: 550, y: 260 },
      { id: "Z4", name: "Latifabad", code: "LTF", x: 340, y: 390 },
      { id: "Z5", name: "SITE Industrial", code: "STE", x: 160, y: 330 },
      { id: "Z6", name: "Autobahn / Kohsar", code: "ATB", x: 290, y: 260 },
      { id: "Z7", name: "Hatri / Bypass", code: "HTR", x: 580, y: 120 },
      { id: "Z8", name: "Jamshoro Link", code: "JSH", x: 80, y: 80 },
    ],
    // Calibrated real driving times across Greater Hyderabad
    matrix: {
      Z1: { Z1: 4, Z2: 14, Z3: 18, Z4: 22, Z5: 16, Z6: 12, Z7: 24, Z8: 15 },
      Z2: { Z1: 14, Z2: 4, Z3: 8, Z4: 12, Z5: 15, Z6: 10, Z7: 18, Z8: 26 },
      Z3: { Z1: 18, Z2: 8, Z3: 4, Z4: 14, Z5: 19, Z6: 12, Z7: 15, Z8: 30 },
      Z4: { Z1: 22, Z2: 12, Z3: 14, Z4: 4, Z5: 14, Z6: 9, Z7: 22, Z8: 32 },
      Z5: { Z1: 16, Z2: 15, Z3: 19, Z4: 14, Z5: 4, Z6: 11, Z7: 28, Z8: 24 },
      Z6: { Z1: 12, Z2: 10, Z3: 12, Z4: 9, Z5: 11, Z6: 4, Z7: 20, Z8: 25 },
      Z7: { Z1: 24, Z2: 18, Z3: 15, Z4: 22, Z5: 28, Z6: 20, Z7: 4, Z8: 32 },
      Z8: { Z1: 15, Z2: 26, Z3: 30, Z4: 32, Z5: 24, Z6: 25, Z7: 32, Z8: 4 },
    },
  },
};

// Generates ANY custom number of zones on a 15km x 12km physical grid
export function generateCustomZones(rawCount) {
  const count = Math.max(2, parseInt(rawCount, 10) || 2);
  const zones = [];

  const cols = Math.ceil(Math.sqrt(count * 1.3));
  const rows = Math.ceil(count / cols);

  const padX = 70;
  const padY = 60;
  const usableWidth = 560;
  const usableHeight = 330;

  const stepX = cols > 1 ? usableWidth / (cols - 1) : usableWidth / 2;
  const stepY = rows > 1 ? usableHeight / (rows - 1) : usableHeight / 2;

  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;

    // Organic road layout jitter
    const jitterX = (i % 2 === 0 ? 1 : -1) * (i % 3) * 6;
    const jitterY = (i % 2 === 0 ? -1 : 1) * (i % 4) * 5;

    const x = Math.round(padX + c * stepX + jitterX);
    const y = Math.round(padY + r * stepY + jitterY);

    zones.push({
      id: `Z${i + 1}`,
      name: `Sector ${i + 1}`,
      code: `S${i + 1}`,
      x: Math.max(45, Math.min(655, x)),
      y: Math.max(45, Math.min(415, y)),
      description: `Metropolitan Sector ${i + 1}`,
    });
  }

  return {
    id: `CUSTOM_${count}`,
    name: `Custom Grid (${count} Zones)`,
    type: "custom",
    zones,
  };
}

export function computeZoneTravelTime(config, originId, destId) {
  // 1. Direct matrix lookup for calibrated presets
  if (
    config.matrix &&
    config.matrix[originId] &&
    config.matrix[originId][destId] !== undefined
  ) {
    return config.matrix[originId][destId];
  }

  const z1 = config.zones.find((z) => z.id === originId);
  const z2 = config.zones.find((z) => z.id === destId);
  if (!z1 || !z2) return 6;

  // Intra-zone travel within the same neighborhood
  if (z1.id === z2.id) {
    return 4; // 4 minutes local neighborhood navigation
  }

  // 2. Physical Manhattan road-grid distance (15km x 12km canvas model)
  const dxKm = Math.abs(z1.x - z2.x) / 46.0; // 46 px ≈ 1 km
  const dyKm = Math.abs(z1.y - z2.y) / 38.0; // 38 px ≈ 1 km
  const totalKm = dxKm + dyKm;

  // Urban driving pace: ~2.4 mins per km (25 km/h average) + 2 min bottleneck buffer
  const drivingMinutes = Math.round(totalKm * 2.4 + 2);

  // Guarantee minimum 6 mins between distinct zones, capped at 35 mins
  return Math.min(35, Math.max(6, drivingMinutes));
}
