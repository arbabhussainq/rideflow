export class DeterministicRNG {
  constructor(seed = 42) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // Chapter 2 Uniform Interarrival Time 1-8 mins[cite: 1]
  getInterarrival() {
    const rd = Math.floor(this.next() * 1000) + 1; // 001 - 1000[cite: 1]
    const value = Math.min(Math.ceil(rd / 125), 8);
    return { rd, value };
  }

  // 2-Digit Local Traffic & Pickup Delay (1 - 3 min)
  getPickupDelay() {
    const rd = Math.floor(this.next() * 100) + 1;
    let value = 1;
    if (rd > 75) value = 3;
    else if (rd > 30) value = 2;
    return { rd, value };
  }

  // 2-Digit Trip Duration (6, 9, 12 min)
  getTripDuration() {
    const rd = Math.floor(this.next() * 100) + 1;
    let value = 6;
    if (rd > 75) value = 12;
    else if (rd > 35) value = 9;
    return { rd, value };
  }

  pickZone(zones) {
    const idx = Math.floor(this.next() * zones.length);
    return zones[idx].id;
  }
}
