/* SKO order tracking — the data contract.
 *
 * The page only ever reads one object per order (shape below). In the demo it is
 * simulated from the clock; in production `SOURCE.get()` becomes one fetch to the
 * store's endpoint, which assembles the same object from three places:
 *   store DB      -> confirmed, warehouse
 *   PackMaster    -> packing, packed (+ trackingNumber written back on label print)
 *   carrier API   -> picked_up, facility (repeats), out_for_delivery, delivered
 *
 * {
 *   order: "4821",
 *   placedAt: "2026-09-14T20:31:00Z",
 *   packer: { name: "Angel" } | null,        // the real packer on shift
 *   carrier: "UPS", service: "Ground",
 *   trackingNumber: "1Z9X2V410355182047" | null,
 *   events: [ { type, at, location? } ]       // oldest first
 * }
 * event.type and what fires it (Jack, 14 Sep 2026). Two systems only: PackMaster and EasyPost.
 *   confirmed         order received (store)
 *   warehouse         order arrives in the PackMaster queue
 *   packing           label bought (EasyPost tracker.created) -> packer = the associate who bought it in PackMaster
 *   packed            the packing-slip barcode scan in PackMaster. One scan per order; there are no other scans.
 *   picked_up         EasyPost tracker.updated, first in_transit detail (the carrier's acceptance scan)
 *   facility          EasyPost tracker.updated, later in_transit details: city + state shown in the carrier card
 *   out_for_delivery  EasyPost status out_for_delivery
 *   delivered         EasyPost status delivered
 *   exception         EasyPost status return_to_sender | failure | error | available_for_pickup
 *   rate              48 hours after delivered -> "rate your experience"
 * carrier is whatever EasyPost reports (UPS or USPS today); trackingUrl is the tracker's public_url.
 * UPS and USPS APIs are not called directly: EasyPost already normalises both.
 */
(function () {
  const TEAM = ["Angel", "Maria", "Luis", "Dani"];      // the packing team; the demo cycles through it
  const PICKUP_HOUR = 15;                              // UPS collects at 3 PM Pacific, Monday to Friday
  const TZ = "America/Los_Angeles";
  const MIN = 60e3, HOUR = 60 * MIN;

  // wall-clock parts of an instant in Pacific time
  function pt(d) {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", weekday: "short", hourCycle: "h23" }).formatToParts(d).map(x => [x.type, x.value]));
    return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, wd: p.weekday };
  }
  // the instant for a Pacific wall-clock time (two passes settle DST)
  function fromPT(y, mo, d, h, mi = 0) {
    let t = Date.UTC(y, mo - 1, d, h, mi);
    for (let i = 0; i < 2; i++) { const w = pt(new Date(t)); t += (Date.UTC(y, mo - 1, d, h, mi) - Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi)); }
    return new Date(t);
  }
  // the next 3 PM pickup at or after an instant, skipping weekends
  function nextPickup(after) {
    let p = pt(after), day = new Date(Date.UTC(p.y, p.mo - 1, p.d));
    if (p.h >= PICKUP_HOUR) day = new Date(+day + 24 * HOUR);
    for (;;) {
      const wd = day.getUTCDay();
      if (wd !== 0 && wd !== 6) return fromPT(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), PICKUP_HOUR);
      day = new Date(+day + 24 * HOUR);
    }
  }
  const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  // ---- demo source: an order that moves forward on the real clock ----
  const t0 = Date.now();
  const speed = Math.max(1, +new URLSearchParams(location.search).get("speed") || 1);
  const now = () => new Date(t0 + (Date.now() - t0) * speed);   // ?speed=60 plays a minute a second

  const PRESETS = {                       // minutes before "now" that the order was placed
    "4821": 9,                            // packing right now
    "4822": 3 * 24 * 60 + 90,             // delivered (packed before that day's 3 PM truck)
    "4824": 6 * 24 * 60 + 90,             // delivered, rate-your-experience is up
    "4823": 32,                           // packed, waiting on the 3 PM truck
  };
  const placedCache = {};
  function placedAt(no) {
    if (!placedCache[no]) placedCache[no] = new Date(t0 - (PRESETS[no] ?? 0) * MIN);
    return placedCache[no];
  }

  function demo(no) {
    const P = placedAt(no), V = now();
    const packed = new Date(+P + 13 * MIN);
    const pick = new Date(+nextPickup(packed) + 7 * MIN);
    const plan = [
      { type: "confirmed", at: P },
      { type: "warehouse", at: new Date(+P + 1 * MIN) },
      { type: "packing", at: new Date(+P + 6 * MIN) },
      { type: "packed", at: packed },
      { type: "picked_up", at: pick, location: "Beverly Hills, CA" },
      { type: "facility", at: new Date(+pick + 50 * MIN), location: "Los Angeles, CA" },
      { type: "facility", at: new Date(+pick + 6.2 * HOUR), location: "Ontario, CA" },
      { type: "out_for_delivery", at: new Date(+pick + 17 * HOUR), location: "Your area" },
      { type: "delivered", at: new Date(+pick + 22.5 * HOUR), location: "Front door" },
      { type: "rate", at: new Date(+pick + 70.5 * HOUR) },                       // 48 h after delivered
    ];
    const events = plan.filter(e => e.at <= V).map(e => ({ ...e, at: e.at.toISOString() }));
    const has = t => events.some(e => e.type === t);
    return {
      order: String(no), placedAt: P.toISOString(),
      packer: has("packing") ? { name: TEAM[hash(no) % TEAM.length] } : null,
      carrier: no === "4823" ? "USPS" : "UPS", service: no === "4823" ? "Ground Advantage" : "Ground",
      trackingNumber: has("packed") ? "1Z9X2V41" + String(1e10 + hash(no) % 9e9).slice(1) : null,
      trackingUrl: has("packed") ? "https://track.easypost.com/djE6dHJrXzEyMzQ1Njc4OTA" : null,   // EasyPost public_url (demo value)
      events, nextPickup: nextPickup(packed).toISOString(), now: V.toISOString(),
    };
  }

  window.SKOTrack = {
    SOURCE: { get: async no => demo(no) },   // production: fetch(`/api/orders/${no}/tracking`).then(r => r.json())
    now, nextPickup, pt, TEAM, PRESETS,
  };
})();
