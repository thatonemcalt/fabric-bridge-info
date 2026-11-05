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

/* ═══════════ reveal on scroll ═══════════ */
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

/* ═══════════ boot sequence demo ═══════════ */
const BOOT_LINES = [
  { t: 180,  st: 0, cls: "c-muted",  text: "$ java -javaagent:plugins/FabricBridge.jar -jar server.jar nogui" },
  { t: 250,  st: 0, cls: "",         text: "Starting the Paper / Purpur server." },
  { t: 220,  st: 1, cls: "c-accent", text: "FabricBridge: agent attached, scanning mods folder." },
  { t: 240,  st: 1, cls: "",         text: "Discovered Fabric mods: 247 in plugins/FabricBridge/mods/" },
  { t: 300,  st: 1, cls: "",         text: "Dependency check: 246 loadable, 1 rejected (missing dependency)" },
  { t: 400,  st: 2, cls: "c-accent", text: "Mixin configs: 190 discovered, preflight checks starting." },
  { t: 260,  st: 2, cls: "c-muted",  text: "Verifying mixin targets against the live server classes." },
  { t: 420,  st: 2, cls: "",         text: "Mixin classes transformed: 190 · skipped with reason: 134 · failed: 0" },
  { t: 380,  st: 3, cls: "c-accent", text: "Registry window open (bootstrap phase)." },
  { t: 300,  st: 3, cls: "",         text: "Entrypoints: 246 ran clean · 6 degraded with reasons" },
  { t: 360,  st: 3, cls: "",         text: "FabricBridge boot summary: 241 mods active, degradation families: axiom, automodpack, balm… " },
  { t: 420,  st: 4, cls: "c-muted",  text: "Starting world. Preparing spawn area: 1 of 12." },
  { t: 300,  st: 4, cls: "",         text: "Preparing spawn area: 90%" },
  { t: 520,  st: 5, cls: "c-ok",     text: "Done (24.102s)! For help, type &quot;help&quot;" },
  { t: 200,  st: 5, cls: "c-muted",  text: "Mods listed as degraded finished boot without their failing part. /fb why &lt;mod&gt; explains." },
];

let bootRunId = 0;
const bootBtn = document.getElementById("bootBtn");
const bootLines = document.getElementById("bootLines");
const bootFill = document.getElementById("bootBarFill");
const bootStages = [...document.querySelectorAll("#bootStages .bs")];
bootBtn.addEventListener("click", async () => {
  const id = ++bootRunId;
  bootBtn.disabled = true; bootBtn.textContent = "⣾ booting…";
  bootLines.innerHTML = ""; bootFill.style.width = "0%";
  bootStages.forEach(s => s.classList.remove("active", "passed"));
  let stage = 0;
  for (const line of BOOT_LINES) {
    if (id !== bootRunId) return;
    await new Promise(r => setTimeout(r, line.t));
    if (id !== bootRunId) return;
    if (line.st > stage) stage = line.st;
    bootStages.forEach(s => {
      const i = +s.dataset.i;
      s.classList.toggle("active", i === line.st);
      s.classList.toggle("passed", i < line.st);
    });
    bootFill.style.width = Math.min(100, ((line.st + 1) / BOOT_LINES[BOOT_LINES.length - 1].st) * 100) + "%";
    const div = document.createElement("span");
    div.className = "ln " + line.cls;
    div.innerHTML = line.text;
    bootLines.appendChild(div);
    bootLines.scrollTop = bootLines.scrollHeight;
  }
  bootBtn.disabled = false; bootBtn.textContent = "▶ Replay";
});

/* placeholder external links — quietly inform until real URLs exist */
document.querySelectorAll("[data-soon]").forEach(el => el.addEventListener("click", e => {
  e.preventDefault();
  const old = el.textContent;
  el.textContent = "coming soon";
  setTimeout(() => (el.textContent = old), 1600);
}));

/* hmm-craft: default boot demo content so the boot panel is never empty */
bootLines.innerHTML = '<span class="ln c-dim">Press Play above to see a full startup, stage by stage.</span>';
