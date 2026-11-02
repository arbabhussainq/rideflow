export class DeterministicRNG {
  constructor(seed = 42) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // getInterarrival() {
  //   const rd = Math.floor(this.next() * 1000) + 1;
  //   const value = Math.min(Math.ceil(rd / 125), 8);
  //   return { rd, value };
  // }

  getInterarrival(lambda = 0.25) {
    const u = Math.max(0.0001, this.next());
    const rawMinutes = -Math.log(u) / lambda;
    const value = Math.max(0, Math.round(rawMinutes));
    const rd = Math.floor(u * 1000) + 1;
    return { rd, value };
  }

  getPickupDelay() {
    const rd = Math.floor(this.next() * 100) + 1;
    let value = 1;
    if (rd > 75) value = 3;
    else if (rd > 30) value = 2;
    return { rd, value };
  }

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
