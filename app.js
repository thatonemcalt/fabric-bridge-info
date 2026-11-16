/* FabricBridge site — app.js — plain JS, no dependencies */
"use strict";

/* ═══════════ theme toggle ═══════════ */
const root = document.documentElement;
const savedTheme = localStorage.getItem("fb-theme");
if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
else if (window.matchMedia("(prefers-color-scheme: light)").matches) root.dataset.theme = "light";

document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("fb-theme", next);
});

/* burger */
const burger = document.getElementById("burger");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  document.getElementById("navLinks").classList.toggle("open");
});
document.querySelectorAll("#navLinks a").forEach(a =>
  a.addEventListener("click", () => { burger.classList.remove("open"); document.getElementById("navLinks").classList.remove("open"); }));

/* ═══════════ reveal on scroll (staggered) ═══════════ */
/* children of .reveal-group get an incremental animation delay */
document.querySelectorAll(".reveal-group").forEach(group => {
  [...group.children].forEach((child, i) => {
    if (child.classList.contains("reveal")) child.style.setProperty("--rd", `${i * 80}ms`);
  });
});
const io = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ═══════════ nav scroll-spy ═══════════ */
const spied = [...document.querySelectorAll(".nav-links a[data-spy]")];
const spyIO = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) {
    spied.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }
}, { rootMargin: "-35% 0px -55% 0px" });
document.querySelectorAll("section[data-spy]").forEach(s => spyIO.observe(s));

/* ═══════════ copy buttons ═══════════ */
document.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", () => {
  navigator.clipboard?.writeText(btn.dataset.copy).catch(() => {});
  btn.textContent = "copied ✓"; btn.classList.add("done");
  setTimeout(() => { btn.textContent = "copy"; btn.classList.remove("done"); }, 1600);
}));

/* ═══════════ searchable command table ═══════════ */
const cmdSearch = document.getElementById("cmdSearch");
const cmdRows = [...document.querySelectorAll("#cmdTable .ct-row")];
const cmdEmpty = document.getElementById("cmdEmpty");
let cmdTag = "all";
function applyCmdFilter() {
  const q = cmdSearch.value.trim().toLowerCase();
  let visible = 0;
  for (const row of cmdRows) {
    const tagOK = cmdTag === "all" || row.dataset.tag === cmdTag;
    const qOK = !q || row.textContent.toLowerCase().includes(q);
    row.classList.toggle("hidden", !(tagOK && qOK));
    if (tagOK && qOK) visible++;
  }
  cmdEmpty.hidden = visible !== 0;
}
cmdSearch?.addEventListener("input", applyCmdFilter);
document.querySelectorAll("#cmdFilters .chip").forEach(chip => chip.addEventListener("click", () => {
  document.querySelectorAll("#cmdFilters .chip").forEach(c => c.classList.remove("on"));
  chip.classList.add("on"); cmdTag = chip.dataset.f; applyCmdFilter();
}));

/* ═══════════ terminal playground ═══════════ */
const termOut = document.getElementById("termOut");
const termIn = document.getElementById("termIn");
const history = []; let histPos = -1;

function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function println(cls, text) {
  const div = document.createElement("span");
  div.className = "ln " + (cls || "");
  div.innerHTML = text;
  termOut.appendChild(div);
  termOut.scrollTop = termOut.scrollHeight;
}

const BOOT_HEADER = [
  ["c-muted", "FabricBridge console demo. Type <span class='c-input'>fb help</span> to see the commands."],
  ["c-dim", "Output format matches the real console."],
  ["", ""],
];

const CMDS = { /* filled below */ };

CMDS["fb status"] = () => [
  ["c-hl", "== FabricBridge — status ==", ],
  ["c-accent", "Runtime: Paper / Purpur · agent attached before server classes load"],
  ["c-muted", "Mixin classes transformed: 190 · preflight-skipped (with reason): 134 · failed applies: 0"],
  ["c-ok", "Registry window: open during the bootstrap phase, refrozen on schedule"],
  ["c-muted", "Report files: plugins/FabricBridge/mods/.reports/ · failed injection calls: 0 · tick exceptions: 0"],
  ["c-ok", "No unhandled exceptions this session."],
];
CMDS["fb degraded"] = () => [
  ["c-warn", "Degraded mods — see fb why <mod> for the reason:"],
  ["c-warn", "axiom 6.1.5 — entrypoint needs a client-only class · partially active"],
  ["c-warn", "automodpack 4.0.7 — client branch during init · sync off"],
  ["c-warn", "balm 21.x — VerifyError in a NeoForge-leaning helper · partially active"],
  ["c-warn", "modernfix 5.x — client-class touch in init · optimizations partially on"],
  ["c-warn", "notenoughcrashes — NPE in its own bootstrap · feature off, vanilla crash path"],
  ["c-warn", "shulkerboxtooltip 9.x — client-class NCDF · partially rendered"],
];
CMDS["fb why axiom"] = () => [
  ["c-hl", "axiom 6.1.5 — degraded (partly failed)"],
  ["c-warn", "Partly failed:"],
  ["c-warn", "  main entrypoint 'com.moulberry.axiom.Axiom' failed, mod may be partially active:"],
  ["c-muted", "  NoClassDefFoundError: onInitialize needs a client-only class that is not present on"],
  ["c-muted", "  this server (touching net/minecraft/class_310; bridge neutralized)"],
  ["c-ok", "Still live: mixins that only touch server-side surfaces ran; registered casts intact."],
  ["c-dim", "Full details: plugins/FabricBridge/mods/.reports/axiom-main-com.moulberry.axiom.Axiom.log"],
];
CMDS["fb why jamlib"] = () => [
  ["c-hl", "jamlib 2.0.0 — fully active"],
  ["c-ok", "No degradations — every mixin applied, entrypoints all ran."],
  ["c-muted", "(Fixed by the bridge's synthetic loader pseudo-mods: isModLoaded('fabricloader') resolves)"],
];
CMDS["fb why automodpack"] = () => [
  ["c-hl", "automodpack 4.0.7 — degraded (partly failed)"],
  ["c-warn", "main entrypoint 'FabricInit::onInitialize' failed, mod may be partially active:"],
  ["c-muted", "  NoClassDefFoundError: net/minecraft/class_310 — client Minecraft class, absent on servers."],
  ["c-ok", "Players still connect normally; only the sync entrypoint is unavailable here."],
];
CMDS["fb why"] = null;   // generic probe — handled specially in runCmd
CMDS["fb mods"] = () => [
  ["c-hl", "/fb mods — page 1 of 12 (248 records)"],
  ["c-ok", "c2me 0.4.0 alpha — fully active (mixin families ×10 bridged)"],
  ["c-ok", "lithium 0.15 — fully active"],
  ["c-ok", "krypton 1.0.4 — fully active"],
  ["c-ok", "fabric-api 0.110 — fully active (4 shim families)"],
  ["c-warn", "axiom 6.1.5 — degraded (partly failed) — see fb why axiom"],
  ["c-warn", "balm 21.x — degraded (partly failed) — see fb why balm"],
  ["c-dim", "/fb mods 2 · /fb mods 3 …"],
];
CMDS["fb skipped"] = () => [
  ["c-hl", "Skipped mixins (134) — feature switched off, vanilla path continues."],
  ["c-muted", "[chunky] ServerLevelMixin (structural: @Access member entityManager missing on ServerLevel)"],
  ["c-muted", "[asynclocator] DolphinSwimToTreasure (target Dolphin$SwimToTreasureGoal not on this build)"],
  ["c-muted", "[c2me-base] access.IChunkSection (validation failed: setBiomeContainer @Arg differs)"],
  ["c-warn", "Skipped mixins are recorded with a reason and don't crash; calls are rerouted to vanilla paths."],
];
CMDS["fb failedmixins"] = () => [
  ["c-ok", "0 — Mixin itself did not fail on any class this session."],
];
CMDS["fb failures"] = () => [
  ["c-warn", "Failures (1 of 6 shown on this entry; 6 total recorded in calm records):"],
  ["c-muted", "[axiom] main entrypoint NCDF — client-only class needed (neutralized)"],
  ["c-dim", "Full text: fb why <mod> for each."],
];
CMDS["fb notloaded"] = () => [
  ["c-hl", "Not loaded (1):"],
  ["c-bad", "rightclickharvest — not loaded — requires 'architectury' [>=19.0.1] but it is not installed"],
  ["c-dim", "Dependency problems are stated as sentences; the mod list is checked before any class loads."],
];
CMDS["fb help"] = () => [
  ["c-hl", "/fb — FabricBridge console"],
  ["c-accent", "  fb status — session overview"],
  ["c-accent", "  fb mods [page] — one line per mod with its state"],
  ["c-accent", "  fb degraded / fb notloaded — mods that partially loaded or didn't load"],
  ["c-accent", "  fb why <mod> — full detail for one mod"],
  ["c-accent", "  fb skipped / failedmixins / failures [page] — mixin reports"],
  ["c-accent", "  fb help — this list"],
  ["c-dim", "Extra demo commands: whoami · clear · stop"],
];
CMDS["whoami"] = () => [
  ["c-ok", "koolaidguyhey"],
];
CMDS["help"] = () => CMDS["fb help"]();
CMDS["clear"] = null;
CMDS["stop"] = () => [
  ["c-warn", "Stopping the server"],
  ["c-muted", "Saving players · Saving worlds · Saving chunks…"],
  ["c-muted", "Disabling FabricBridge."],
  ["c-dim", "(Demo console — type any command to keep going.)"],
];

function runCmd(raw) {
  const input = raw.trim();
  println("c-input", "&nbsp;srv ›&nbsp;" + esc(input));
  if (!input) return;
  history.push(input); histPos = history.length;
  const lower = input.toLowerCase();
  let key = null;
  Object.keys(CMDS).forEach(k => { if (!key && lower.startsWith(k)) key = k; });
  if (!key) {
    println("c-bad", `Unknown command &nbsp;<b>${esc(input)}</b>`);
    println("c-dim", 'Type <span class="c-input">fb help</span> (or just <span class="c-input">help</span>).');
    return;
  }
  if (key === "clear") { termOut.innerHTML = ""; return; }
  if (key.startsWith("fb why")) {
    const mod = input.slice(6).trim().toLowerCase();
    const alias = { "axiom": "fb why axiom", "jamlib": "fb why jamlib", "automodpack": "fb why automodpack" }[mod];
    if (alias) { for (const [cls, text] of CMDS[alias]()) println(cls, text); }
    else if (!mod) println("c-dim", 'Usage: <span class="c-input">fb why &lt;mod&gt;</span> — demo probes available: axiom · jamlib · automodpack.');
    else println("c-warn", `FabricBridge would probe its records for '${esc(mod)}' now — on a real server you'd get its full report. Demo probes: axiom · jamlib · automodpack.`);
    return;
  }
  const fn = CMDS[key];
  if (!fn) return;
  for (const [cls, text] of fn()) println(cls, text);
}

/* pre-seed console */
for (const [cls, text] of BOOT_HEADER) println(cls, text);
println("c-muted", '› click a chip, or type <span class="c-input">fb status</span> and hit enter');

termIn.addEventListener("keydown", e => {
  if (e.key === "Enter") { runCmd(termIn.value); termIn.value = ""; }
  else if (e.key === "ArrowUp") { if (histPos > 0) termIn.value = history[--histPos] || ""; e.preventDefault(); }
  else if (e.key === "ArrowDown") { if (histPos < history.length) termIn.value = history[++histPos] || ""; e.preventDefault(); }
});
termOut.addEventListener("click", () => termIn.focus());
document.querySelectorAll(".term-chips .chip").forEach(c => c.addEventListener("click", () => { runCmd(c.dataset.cmd); termIn.focus(); }));

/* placeholder external links — quietly inform until real URLs exist */
document.querySelectorAll("[data-soon]").forEach(el => el.addEventListener("click", e => {
  e.preventDefault();
  const old = el.textContent;
  el.textContent = "coming soon";
  setTimeout(() => (el.textContent = old), 1600);
}));

/* ═══════════════════════════════════════════════════════════════
   Scroll-scrub engine — Apple-style.
   Progress of each .story wrapper (0→1 through its scroll room)
   drives its pinned .stage. Position-driven, so animation plays
   while you scroll and freezes exactly where you stop.
   ═══════════════════════════════════════════════════════════════ */
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = v => Math.min(1, Math.max(0, v));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const seg = (p, a, b) => easeOut(clamp01((p - a) / (b - a)));

function progressOf(el) {
  const r = el.getBoundingClientRect();
  const room = r.height - innerHeight;
  if (room <= 0) return 1;
  return clamp01(-r.top / room);
}

const scrubbers = [];
function registerScrub(el, render) {
  if (!REDUCED && el) scrubbers.push({ el, render, last: -1 });
}

const scrollFill = document.getElementById("scrollFill");
const heroFig = document.querySelector(".hero-panel .mini-fig");

let ticking = false;
function onScroll() {
  if (!ticking) { ticking = true; requestAnimationFrame(update); }
}

function update() {
  ticking = false;

  /* nav progress bar */
  const max = root.scrollHeight - innerHeight;
  if (scrollFill) scrollFill.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";

  /* hero parallax — the figure drifts up slightly as the hero leaves */
  if (heroFig) {
    const hero = heroFig.closest(".hero").getBoundingClientRect();
    heroFig.style.transform = hero.bottom > 0
      ? `translateY(${clamp01(-hero.top / hero.bottom) * -12}px)`
      : "none";
  }

  /* stories */
  for (const s of scrubbers) {
    if (s.el === bootStoryEl && bootAutoId) continue; /* autopilot owns it right now */
    const r = s.el.getBoundingClientRect();
    if (r.bottom < -60 || r.top > innerHeight + 60) continue;
    const p = progressOf(s.el);
    if (Math.abs(p - s.last) < .0006 && p > 0 && p < 1) continue;
    s.last = p;
    s.render(p);
  }
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);

/* ═══════════ story 1 — how a mod joins ═══════════ */
const bridgeStory = document.querySelector('[data-story="bridge"]');
if (bridgeStory) {
  const $ = id => document.getElementById(id);
  const jar = $("bJar"), beam1 = $("bBeam1"), beam2 = $("bBeam2"), bridge = $("bBridge"),
        server = $("bServer"), bFrom = $("bFrom"), bArrow = $("bArrow"), bTo = $("bTo"),
        bCheck = $("bCheck"), bSkip = $("bSkip"), bChips = $("bChips"), bCalm = $("bCalm");
  const checkItems = [...bCheck.querySelectorAll("[data-ci]")];
  const chips = [...bChips.querySelectorAll("[data-ci]")];
  const beats = [...bridgeStory.querySelectorAll(".beat")];
  const hint = bridgeStory.querySelector(".story-hint");
  const WORD = "ItemStack";
  let remapped = false;

  registerScrub(bridgeStory, p => {
    /* jar slides in, beams fire, bridge logo settles */
    jar.style.opacity = seg(p, .02, .12);
    jar.style.transform = `translateX(${(1 - seg(p, .02, .12)) * -44}px)`;
    beam1.style.transform = `scaleX(${seg(p, .08, .17)})`;
    beam2.style.transform = `scaleX(${seg(p, .17, .26)})`;
    const bScale = 1 + .07 * seg(p, .1, .2);
    bridge.style.transform = `scale(${bScale})`;
    bridge.style.opacity = seg(p, .02, .1);
    server.style.opacity = seg(p, .04, .14);

    /* remap types itself in */
    const typed = Math.round(seg(p, .14, .24) * WORD.length);
    bTo.textContent = typed ? WORD.slice(0, typed) : "\u00a0";
    if (typed >= WORD.length && !remapped) {
      remapped = true;
      bFrom.classList.add("swapped");
      bArrow.classList.add("hot");
    } else if (typed < WORD.length && remapped) {
      remapped = false;
      bFrom.classList.remove("swapped");
      bArrow.classList.remove("hot");
    }

    /* mixin checklist */
    bCheck.style.opacity = seg(p, .28, .33);
    checkItems.forEach((ci, i) => {
      if (ci === bSkip) ci.classList.toggle("on", seg(p, .46, .5) > .5);
      else ci.classList.toggle("on", seg(p, .33 + i * .05, .38 + i * .05) > .5);
    });

    /* entrypoint chips */
    bChips.style.opacity = seg(p, .54, .6);
    chips.forEach((c, i) => {
      const t = seg(p, .55 + i * .045, .61 + i * .045);
      c.style.opacity = t;
      c.style.transform = `translateY(${(1 - t) * 8}px)`;
    });

    /* calm-degradation line */
    bCalm.style.opacity = seg(p, .8, .87);

    /* caption crossfades — four beats along the timeline */
    const A = [0, .26, .52, .78];
    beats.forEach((b, i) => {
      const inT = seg(p, A[i], A[i] + .07);
      const outT = i < 3 ? seg(p, A[i + 1], A[i + 1] + .07) : 0;
      const o = inT * (1 - outT);
      b.style.opacity = o;
      b.style.transform = `translateY(${(1 - inT) * 14}px)`;
      b.style.visibility = o < .01 ? "hidden" : "visible";
    });

    if (hint) hint.style.opacity = p > .06 ? 0 : .8;
  });
}

/* ═══════════ story 2 — install ═══════════ */
const installStory = document.querySelector('[data-story="install"]');
if (installStory) {
  const iFolder = document.getElementById("iFolder");
  const iJar = document.getElementById("iJar");
  const iCmdAgent = document.getElementById("iCmdAgent");
  const iCmdPatch = document.getElementById("iCmdPatch");
  const iMods = document.getElementById("iMods");
  const modChips = [...iMods.querySelectorAll(".imod")];
  const beats = [...installStory.querySelectorAll(".beat")];
  const hint = installStory.querySelector(".story-hint");
  const AGENT = "-javaagent:plugins/FabricBridge-1.0-mc1.21.11.jar -jar server.jar";
  const PATCH = "upload → restart — the jar patches the launch itself";

  registerScrub(installStory, p => {
    /* jar drops into plugins/ */
    const drop = seg(p, .02, .13);
    iJar.style.opacity = drop;
    iJar.style.transform = `translateY(${(1 - drop) * -34}px)`;
    iFolder.classList.toggle("lit", p > .08);

    /* terminal line: agent flag types itself during beat 1 */
    const agentOn = p < .5;
    iCmdAgent.classList.toggle("live", agentOn);
    iCmdPatch.classList.toggle("live", !agentOn);
    const agentTyped = Math.round(seg(p, .28, .44) * AGENT.length);
    if (iCmdAgent.dataset.typed !== String(agentTyped)) {
      iCmdAgent.dataset.typed = String(agentTyped);
      iCmdAgent.innerHTML = (AGENT.slice(0, agentTyped) || "\u00a0")
        .replace(/-javaagent:[^ ]*/, m => `<b>${esc(m)}</b>`) +
        `<span class="cursor" style="opacity:${agentTyped && agentTyped < AGENT.length ? 1 : 0}"></span>`;
    }
    const patchTyped = Math.round(seg(p, .53, .66) * PATCH.length);
    if (iCmdPatch.dataset.typed !== String(patchTyped)) {
      iCmdPatch.dataset.typed = String(patchTyped);
      iCmdPatch.innerHTML = (PATCH.slice(0, patchTyped) || "\u00a0")
        .replace(/— the jar patches.*/, m => `<b>${esc(m)}</b>`) +
        ` <span class="ipatch-badge" style="opacity:${seg(p, .5, .54)}">no flags</span>` +
        `<span class="cursor" style="opacity:${patchTyped && patchTyped < PATCH.length ? 1 : 0}"></span>`;
    }

    /* mods folder fills during beat 3 */
    iMods.style.opacity = seg(p, .77, .82);
    modChips.forEach((m, i) => {
      const t = seg(p, .78 + i * .04, .83 + i * .04);
      m.style.opacity = t;
      m.style.transform = `translateY(${(1 - t) * 8}px)`;
    });

    /* captions */
    const A = [0, .25, .5, .75];
    beats.forEach((b, i) => {
      const inT = seg(p, A[i], A[i] + .07);
      const outT = i < 3 ? seg(p, A[i + 1], A[i + 1] + .07) : 0;
      const o = inT * (1 - outT);
      b.style.opacity = o;
      b.style.transform = `translateY(${(1 - inT) * 14}px)`;
      b.style.visibility = o < .01 ? "hidden" : "visible";
    });

    if (hint) hint.style.opacity = p > .06 ? 0 : .8;
  });
}

/* ═══════════ story 3 — boot console (scrub + optional auto-boot) ═══════════ */
const BOOT_LINES = [
  { st: 0, cls: "c-muted",  text: "$ java -javaagent:plugins/FabricBridge-1.0-mc1.21.11.jar -jar server.jar nogui" },
  { st: 0, cls: "",         text: "Starting the Paper / Purpur server." },
  { st: 1, cls: "c-accent", text: "FabricBridge: agent attached, scanning mods folder." },
  { st: 1, cls: "",         text: "Discovered Fabric mods: 247 in plugins/FabricBridge/mods/" },
  { st: 1, cls: "",         text: "Dependency check: 246 loadable, 1 rejected (missing dependency)" },
  { st: 2, cls: "c-accent", text: "Mixin configs: 190 discovered, preflight checks starting." },
  { st: 2, cls: "c-muted",  text: "Verifying mixin targets against the live server classes." },
  { st: 2, cls: "",         text: "Mixin classes transformed: 190 · skipped with reason: 134 · failed: 0" },
  { st: 3, cls: "c-accent", text: "Registry window open (bootstrap phase)." },
  { st: 3, cls: "",         text: "Entrypoints: 246 ran clean · 6 degraded with reasons" },
  { st: 3, cls: "",         text: "FabricBridge boot summary: 241 mods active, degradation families: axiom, automodpack, balm…" },
  { st: 4, cls: "c-muted",  text: "Starting world. Preparing spawn area: 1 of 12." },
  { st: 4, cls: "",         text: "Preparing spawn area: 90%" },
  { st: 5, cls: "c-ok",     text: "Done (24.102s)! For help, type &quot;help&quot;" },
  { st: 5, cls: "c-muted",  text: "Mods listed as degraded finished boot without their failing part. /fb why &lt;mod&gt; explains." },
];

const bootStoryEl = document.querySelector('[data-story="boot"]');
const bootLines = document.getElementById("bootLines");
const bootFill = document.getElementById("bootBarFill");
const bootStages = [...document.querySelectorAll("#bootStages .bs")];
const bootBtn = document.getElementById("bootBtn");
const HINT_HTML = '<span class="ln c-dim">scroll to boot — each line arrives as you move down…</span>';
bootLines.innerHTML = HINT_HTML;

let bootShown = 0;
function bootRender(p) {
  const n = BOOT_LINES.length;
  const need = Math.round(p * n);
  while (bootShown < need) {
    const line = BOOT_LINES[bootShown];
    const div = document.createElement("span");
    div.className = "ln " + line.cls;
    div.innerHTML = line.text;
    bootLines.appendChild(div);
    bootShown++;
  }
  while (bootShown > need) {
    bootLines.lastElementChild.remove();
    bootShown--;
  }
  if (bootShown > 0 && bootLines.firstElementChild.classList.contains("c-dim")) {
    bootLines.firstElementChild.remove();
  } else if (bootShown === 0 && !bootLines.querySelector(".c-dim")) {
    bootLines.insertAdjacentHTML("afterbegin", HINT_HTML);
  }
  bootLines.scrollTop = bootLines.scrollHeight;

  const st = bootShown > 0 ? BOOT_LINES[bootShown - 1].st : -1;
  bootStages.forEach(s => {
    const i = +s.dataset.i;
    s.classList.toggle("active", i === st);
    s.classList.toggle("passed", i < st);
  });
  bootFill.style.width = (p * 100).toFixed(1) + "%";
}

let bootAutoId = 0;
function bootStopAuto(label) {
  if (bootAutoId) { cancelAnimationFrame(bootAutoId); bootAutoId = 0; }
  bootBtn.textContent = label || "▶ auto-boot";
}
bootBtn.addEventListener("click", () => {
  if (bootAutoId) { bootStopAuto(); return; }
  bootShown = 0;
  bootLines.innerHTML = "";
  bootRender(0);
  const start = performance.now(), dur = 11000;
  bootBtn.textContent = "■ stop";
  const step = now => {
    const p = Math.min(1, (now - start) / dur);
    bootRender(p);
    if (p < 1) bootAutoId = requestAnimationFrame(step);
    else { bootAutoId = 0; bootBtn.textContent = "▶ replay"; }
  };
  bootAutoId = requestAnimationFrame(step);
});

if (!REDUCED && bootStoryEl) {
  registerScrub(bootStoryEl, bootRender);
  /* any user scroll cancels the auto-boot */
  addEventListener("scroll", () => { if (bootAutoId) bootStopAuto(); }, { passive: true, once: false });
} else {
  /* reduced motion or no scrub: render the finished boot statically */
  bootRender(1);
  bootBtn.style.display = "none";
}

/* ═══════════ count-up stats ═══════════ */
const cuIO = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) {
    cuIO.unobserve(e.target);
    const el = e.target, target = +el.dataset.count, dur = 1100, start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    if (REDUCED) el.textContent = target; else requestAnimationFrame(step);
  }
}, { threshold: .4 });
document.querySelectorAll(".stat-num[data-count]").forEach(el => cuIO.observe(el));

/* kick everything off */
if (!REDUCED) update(); else document.querySelectorAll(".story-hint").forEach(h => h.remove());
