/* SKO order tracking — the page. Reads one order object from SKOTrack.SOURCE (see data.js) and renders it. */
(function () {
  const $ = id => document.getElementById(id);
  const ICON = n => `../../img/icons/sm/${n}.png`;
  const { SOURCE, now } = window.SKOTrack;
  const qs = new URLSearchParams(location.search);
  const FAST = +qs.get("speed") > 1;
  // production: the session decides. A guest checkout gets a guest record; registering upgrades it in place.
  let member = qs.get("member") === "1" || (() => { try { return localStorage.getItem("sko_member") === "1"; } catch (e) { return false; } })();

  // the eight steps, in order; facility can repeat and the step shows the latest one
  const STEPS = ["confirmed", "warehouse", "packing", "packed", "picked_up", "facility", "out_for_delivery", "delivered"];
  const SPIN_EVENTS = ["packed", "picked_up", "facility", "out_for_delivery", "delivered"];   // each new update earns a spin

  // ---------- time words ----------
  const fmtTime = d => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  function when(iso) {
    const d = new Date(iso), n = now();
    const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(n) - day(d)) / 864e5);
    const w = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : diff === -1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    return `${w}, ${fmtTime(d)}`;
  }
  const whenInline = iso => when(iso).replace(/^(Today|Yesterday|Tomorrow)/, m => m.toLowerCase());
  function dayWord(iso) {
    const d = new Date(iso), n = now();
    const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(d) - day(n)) / 864e5);
    return diff === 0 ? "today" : diff === 1 ? "tomorrow" : d.toLocaleDateString("en-US", { weekday: "long" });
  }

  // ---------- routing ----------
  let order = null, orderNo = qs.get("order"), lastCount = -1;
  function show(which) { $("lookup").hidden = which !== "lookup"; $("tracker").hidden = which !== "tracker"; }
  function go(no) {
    orderNo = String(no); const u = new URL(location.href); u.searchParams.set("order", orderNo);
    history.pushState({}, "", u); lastCount = -1; start();
  }
  $("lf").onsubmit = e => {
    e.preventDefault();
    const no = $("lno").value.replace(/\D/g, ""), zip = $("lzip").value.replace(/\D/g, "");
    if (no.length < 3) return ($("lerr").textContent = "Enter the order number from your confirmation email.");
    if (zip.length !== 5) return ($("lerr").textContent = "Enter the 5-digit ZIP code the order ships to.");
    $("lerr").textContent = ""; go(no);
  };
  document.querySelectorAll(".try button").forEach(b => (b.onclick = () => go(b.dataset.o)));
  $("other").onclick = () => { const u = new URL(location.href); u.searchParams.delete("order"); history.pushState({}, "", u); orderNo = null; start(); };
  addEventListener("popstate", () => { orderNo = new URLSearchParams(location.search).get("order"); start(); });

  // ---------- spins + prizes, remembered per order ----------
  const key = () => `sko_track_${orderNo}`;
  function ledger() { try { return JSON.parse(localStorage.getItem(key())) || { used: 0, bonus: 0, prizes: [] }; } catch (e) { return { used: 0, bonus: 0, prizes: [] }; } }
  function saveLedger(l) { try { localStorage.setItem(key(), JSON.stringify(l)); } catch (e) {} }
  function spinsLeft() {
    if (!order) return 0;
    const earned = 1 + new Set(order.events.filter(e => SPIN_EVENTS.includes(e.type)).map(e => e.type)).size;   // 1 free daily spin + 1 per kind of update
    const l = ledger(); return Math.max(0, earned + l.bonus - l.used);
  }

  // ---------- render ----------
  function copyFor(o) {
    const ev = o.events, last = ev[ev.length - 1], name = o.packer?.name || "Our team";
    const at = t => ev.filter(e => e.type === t).pop();
    switch (last.type) {
      case "confirmed": return ["Order confirmed.", "We've got it. It's headed to the warehouse."];
      case "warehouse": return ["The warehouse has your order.", "Beverly Hills, CA. It's next in line to be packed."];
      case "packing": return [`${name} is packing your order.`, `Started at ${fmtTime(new Date(last.at))}. It only takes a few minutes.`];
      case "packed": return [`Packed by ${name}.`, `Sealed at ${fmtTime(new Date(last.at))} and the label's printed.`];
      case "picked_up": return ["It's on its way.", `UPS picked it up in Beverly Hills, ${whenInline(last.at)}.`];
      case "facility": return [`At the UPS facility in ${last.location}.`, "It's being sorted. Next stop is your area."];
      case "out_for_delivery": return ["Out for delivery today.", "It's on the truck. Keep an eye on the door."];
      case "delivered": return ["Delivered.", `Left at your front door, ${whenInline(last.at)}.`];
    }
  }

  function render(o, first) {
    order = o;
    const ev = o.events, last = ev[ev.length - 1];
    const idx = STEPS.indexOf(last.type), done = last.type === "delivered";
    $("ordno").textContent = `ORDER #${o.order}`;
    const [h, s] = copyFor(o);
    if (first || $("head").textContent !== h) {
      const sw = $("swap"); const apply = () => { $("head").textContent = h; $("sub").textContent = s; sw.classList.remove("out"); };
      if (first) apply(); else { sw.classList.add("out"); setTimeout(apply, 200); }
    } else $("sub").textContent = s;
    $("eyebrow").textContent = done ? "DELIVERED" : "RIGHT NOW";
    const showPerson = (last.type === "packing" || last.type === "packed") && o.packer;
    $("person").hidden = !showPerson;
    if (showPerson) { $("pname").textContent = o.packer.name; $("initials").textContent = o.packer.name[0]; }
    $("bar").innerHTML = STEPS.map((_, i) => `<i class="${i < idx || done ? "done" : i === idx ? "now" : ""}" style="--p:${(i / 7 * 100).toFixed(1)}%"></i>`).join("");

    // pickup: only while packed and waiting on the truck
    $("pickup").hidden = last.type !== "packed";
    if (last.type === "packed") {
      const dw = dayWord(o.nextPickup);
      $("ptext").textContent = `Picks up ${dw} at 3:00 PM`;
      $("pkick").textContent = dw === "today" ? "UPS PICKUP" : "PACKED AFTER TODAY'S 3 PM PICKUP";
    }
    tick();

    // carrier: the latest scan once UPS has it
    const scans = ev.filter(e => ["picked_up", "facility", "out_for_delivery", "delivered"].includes(e.type));
    $("track").hidden = !scans.length;
    if (scans.length) {
      const sc = scans[scans.length - 1];
      const label = { picked_up: `Picked up in ${sc.location}`, facility: `Arrived at UPS facility, ${sc.location}`, out_for_delivery: "Out for delivery", delivered: "Delivered, front door" }[sc.type];
      $("scanb").textContent = label; $("scant").textContent = when(sc.at);
      const mapq = sc.type === "facility" || sc.type === "picked_up" ? `UPS ${sc.location}` : "";
      $("map").hidden = !mapq; $("map").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mapq);
      $("carrier").textContent = `${o.carrier} · ${o.service}`.toUpperCase();
    }
    if (o.trackingNumber) {
      $("copy").textContent = o.trackingNumber.replace(/^(.{2})(.{3})(.{3})(.{2})(.{4})(.+)$/, "$1 $2 $3 $4 $5 $6");
      $("upslink").href = "https://www.ups.com/track?tracknum=" + o.trackingNumber;
    }

    // timeline
    $("steps").innerHTML = STEPS.map((t, i) => {
      const e = ev.filter(x => x.type === t).pop();
      const c = i < idx || done ? "done" : i === idx ? "now" : "later";
      const name = o.packer?.name;
      const label = {
        confirmed: "Order confirmed", warehouse: "At the warehouse",
        packing: e && name ? `${name} started packing` : "Packing",
        packed: "Packed, label printed",
        picked_up: e ? "Picked up by UPS" : `UPS pickup, ${dayWord(o.nextPickup)} at 3:00 PM`,
        facility: e ? `At the UPS facility, ${e.location}` : "At the UPS facility",
        out_for_delivery: "Out for delivery", delivered: "Delivered",
      }[t];
      return `<li class="${c}"><i class="pt"></i><span class="t">${label}</span><span class="tm">${e ? when(e.at) : ""}</span></li>`;
    }).join("");

    renderAccount(); renderSpins(); renderPrizes();

    // a new update while the page is open: say so, and hand over the spin it earned
    if (lastCount >= 0 && ev.length > lastCount) {
      const earned = SPIN_EVENTS.includes(last.type);
      toast(`<span>New update · <b>${h.replace(/\.$/, "")}</b></span>${earned ? "<em>+1 spin</em>" : ""}`);
    }
    lastCount = ev.length;
  }

  function renderAccount() {
    $("acct").hidden = !member; $("joinc").hidden = member; $("boredc").hidden = !member;
  }
  $("join").onclick = () => { member = true; try { localStorage.setItem("sko_member", "1"); } catch (e) {} renderAccount(); renderSpins(); renderPrizes(); toast("<span>Account created · <b>your spin is ready</b></span><em>+1 spin</em>"); };
  function renderSpins() {
    const n = member ? spinsLeft() : 0;
    $("boredh").textContent = order && order.events.at(-1).type === "delivered" ? "One more for the road" : "Bored?";
    const done = order && order.events.at(-1).type === "delivered";
    $("boredp").textContent = n ? `You've got ${n === 1 ? "a free spin" : n + " free spins"}${done ? "." : " while it's on the way."}` : done ? "Come back tomorrow for your free daily spin." : "Your next spin unlocks at the next update.";
    $("openspin").disabled = !n; $("openspin").textContent = n ? "Spin the wheel" : "No spins right now";
  }
  function renderPrizes() {
    const p = ledger().prizes.filter(x => x.n !== "Spin again");
    $("prizec").hidden = !member || !p.length;
    $("prizes").innerHTML = p.map(x => `<li><img src="${ICON(x.ico)}" alt=""><div><b>${x.n}</b><span>${x.d}</span></div></li>`).join("");
  }

  // pickup countdown on the page's clock
  function tick() {
    if (!order || $("pickup").hidden) return;
    let s = Math.max(0, Math.floor((new Date(order.nextPickup) - now()) / 1000));
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    $("pcount").textContent = s === 0 ? "any minute" : h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(x).padStart(2, "0")}s`;
    $("pcount").style.fontSize = s === 0 ? "20px" : "";
  }
  setInterval(tick, 1000);

  let toastT = 0;
  function toast(html) { const t = $("toast"); t.innerHTML = html; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 3600); }

  $("copy").onclick = async () => { if (!order?.trackingNumber) return; try { await navigator.clipboard.writeText(order.trackingNumber); const t = $("copy").textContent; $("copy").textContent = "Copied"; setTimeout(() => ($("copy").textContent = t), 1300); } catch (e) {} };

  // ---------- load + live refresh ----------
  let poll = 0;
  async function refresh(first) { if (!orderNo) return; render(await SOURCE.get(orderNo), first); }
  function start() {
    clearInterval(poll);
    if (!orderNo) { show("lookup"); setTimeout(() => $("lno").focus(), 50); return; }
    show("tracker"); refresh(true);
    poll = setInterval(() => refresh(false), FAST ? 1000 : 15000);
  }

  // ---------- the wheel: every slice is a prize ----------
  const PRIZES = [
    { n: "THE FULL BOX", s: "Full box", d: "A full box of whatever you pick", ico: "golden", w: 1 },
    { n: "Free shipping", s: "Free ship", d: "On your next order", ico: "freeship", w: 22 },
    { n: "A free vial", s: "Vial $49", d: "Any vial up to $49", ico: "vial", w: 16 },
    { n: "Spin again", s: "Spin again", d: "One more, on us", ico: "spin", w: 15 },
    { n: "A mystery box", s: "Mystery", d: "Sealed. Something good inside", ico: "mystery", w: 8 },
    { n: "The SKO hat", s: "SKO hat", d: "Ships with your next order", ico: "hat", w: 12 },
    { n: "A free vial", s: "Vial $99", d: "Any vial up to $99", ico: "vials", w: 6 },
    { n: "Free shipping", s: "Free ship", d: "On your next order", ico: "freeship", w: 20 },
  ];
  const N = PRIZES.length, SEG = 360 / N, wheel = $("wheel");
  wheel.style.background = `conic-gradient(${PRIZES.map((_, i) => `${i % 2 ? "#E9EEF7" : "#FFFFFF"} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(",")})`;
  wheel.innerHTML = PRIZES.map((p, i) => `<div class="w" style="transform:rotate(${i * SEG + SEG / 2}deg)"><img src="${ICON(p.ico)}" alt=""><u>${p.s}</u></div>`).join("")
    + `<svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%">${PRIZES.map((_, i) => { const a = (i * SEG - 90) * Math.PI / 180; return `<line x1="50" y1="50" x2="${50 + 50 * Math.cos(a)}" y2="${50 + 50 * Math.sin(a)}" stroke="#16265C" stroke-opacity=".12" stroke-width=".5"/>`; }).join("")}</svg>`;

  let turn = 0, busy = false;
  const idle = () => { $("result").innerHTML = "<span>Tap spin. It always lands on something.</span>"; };
  function openSheet() { $("veil").classList.add("on"); idle(); const n = spinsLeft(); $("spin").disabled = !n; $("spin").textContent = n ? "Spin" : "No spins right now"; }
  function closeSheet() { if (busy) return; $("veil").classList.remove("on"); renderSpins(); renderPrizes(); }
  $("openspin").onclick = openSheet; $("close").onclick = closeSheet;
  $("veil").onclick = e => { if (e.target.id === "veil") closeSheet(); };
  addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });
  $("spin").onclick = () => {
    if (busy || !spinsLeft()) return; busy = true;
    const l = ledger(); l.used++;
    // production: the server picks the slice and records it; the page only animates the answer
    const tot = PRIZES.reduce((a, p) => a + p.w, 0); let r = Math.random() * tot, pick = 0;
    for (let i = 0; i < N; i++) { r -= PRIZES[i].w; if (r <= 0) { pick = i; break; } }
    const p = PRIZES[pick];
    if (p.n === "Spin again") l.bonus++; else l.prizes.push({ n: p.n, d: p.d, ico: p.ico });
    saveLedger(l);
    const land = 360 - (pick * SEG + SEG / 2) + (Math.random() - .5) * SEG * .55;
    turn += 360 * 6 + ((land - (turn % 360)) + 360) % 360;
    wheel.style.transition = "transform 4.6s cubic-bezier(.12,.72,.08,1)"; wheel.style.transform = `rotate(${turn}deg)`;
    $("spin").disabled = true; $("result").innerHTML = "<span>Spinning…</span>";
    setTimeout(() => {
      $("result").innerHTML = `<div class="pop" style="display:flex;flex-direction:column;align-items:center"><div class="kicker">YOU WON</div><b>${p.n}</b><span>${p.n === "Spin again" ? "Go again." : p.d + " · ships inside your next order"}</span></div>`;
      const n = spinsLeft(); $("spin").disabled = !n; $("spin").textContent = n ? "Spin" : "No spins right now";
      confetti(p.n === "THE FULL BOX" ? 220 : 90); busy = false;
    }, 4700);
  };

  // brand-coloured confetti, short and quiet
  const cv = $("fx"), cx = cv.getContext("2d"); let parts = [], raf = 0;
  function fit() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; cx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); }
  addEventListener("resize", fit); fit();
  function confetti(n) {
    const cols = ["#16265C", "#9DBFD9", "#BAC7F2", "#5BAEE5", "#C3AFD7", "#FFFFFF"];
    for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2, y: innerHeight * .45, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4, s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .35, c: cols[i % cols.length], l: 0 });
    if (!raf) loop();
  }
  function loop() {
    cx.clearRect(0, 0, innerWidth, innerHeight); parts = parts.filter(p => p.l < 170 && p.y < innerHeight + 30);
    for (const p of parts) { p.vy += .36; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.l++; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); }
    raf = parts.length ? requestAnimationFrame(loop) : 0;
  }

  start();
})();
