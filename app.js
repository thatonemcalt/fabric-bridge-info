/* FabricBridge site — app.js — plain JS, no dependencies */
"use strict";

/* ═══════════ outbound links — one source of truth ═══════════
   The Modrinth slug is fixed when the project is published. Change it
   once here and every download button, footer link and doc example follows. */
const MODRINTH_URL = "https://modrinth.com/plugin/fabric-bridge-plugin";
document.querySelectorAll("[data-modrinth]").forEach(a => { a.href = MODRINTH_URL; a.rel = "noopener"; });

/* ═══════════ theme toggle ═══════════ */
const root = document.documentElement;
let savedTheme = null;
try { savedTheme = localStorage.getItem("fb-theme"); } catch (e) { /* private mode / blocked storage */ }
if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
else if (window.matchMedia("(prefers-color-scheme: light)").matches) root.dataset.theme = "light";

document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try { localStorage.setItem("fb-theme", next); } catch (e) { /* storage unavailable: theme still switches */ }
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
const reveals = [...document.querySelectorAll(".reveal")];
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: .12 });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add("in"));   /* no observer: never leave content invisible */
}

/* ═══════════ nav scroll-spy ═══════════ */
const spied = [...document.querySelectorAll(".nav-links a[data-spy]")];
const spyIO = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) {
    spied.forEach(a => {
      const on = a.getAttribute("href") === "#" + e.target.id;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
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
  if (!termOut) return;            /* pages without the console demo (changelog) */
  const div = document.createElement("span");
  div.className = "ln " + (cls || "");
  div.innerHTML = text;
  termOut.appendChild(div);
  termOut.scrollTop = termOut.scrollHeight;
}

const BOOT_HEADER = [
  ["c-muted", "FabricBridge console demo. Type <span class='c-input'>fb help</span> to see the commands."],
  ["c-dim", "Output format matches the real console."],
  ["c-dim", "Illustrative session — your mods, versions and counts will differ."],
  ["", ""],
];

const CMDS = { /* filled below */ };

CMDS["fb status"] = () => [
  ["c-hl", "FabricBridge 1.0 | runtime mappings: Mojang"],
  ["c-muted", "Mods loaded: 41, rejected: 2 | mixin ready: true"],
  ["c-muted", "Classes remapped: 465, mixin-transformed: 163, access-widened: 193"],
  ["c-muted", "Registry window closed after the entrypoint phase · .reports/ holds every failure stack"],
  ["c-ok", "No unhandled exceptions this session. 0 crash-reports."],
];
CMDS["fb degraded"] = () => [
  ["c-warn", "Degraded (7 mods) — see fb why &lt;mod&gt; for the reason:"],
  ["c-warn", "fabric-api ×5 — mixin families skipped on this host build"],
  ["c-warn", "architectury — 2 mixins skipped (structural drift) · partially active"],
  ["c-warn", "ftbessentials — 1 mixin skipped (accessor missing) · partially active"],
];
CMDS["fb why architectury"] = () => [
  ["c-hl", "architectury — degraded (2 mixins skipped)"],
  ["c-warn", "Skipped:"],
  ["c-warn", "  MixinServerLevel — @Shadow field 'entityManager' is not on ServerLevel"],
  ["c-warn", "  MixinPersistentEntitySectionManager — state field wired by a pre-loaded mixin"],
  ["c-ok", "Still live: the rest of architectury's entry points and mixins ran."],
  ["c-dim", "Full details: plugins/FabricBridge/mods/.reports/architectury-*.log"],
];
CMDS["fb why jamlib"] = () => [
  ["c-hl", "jamlib — fully active"],
  ["c-ok", "No degradations — every mixin applied, entrypoints all ran."],
  ["c-muted", "(Fixed by the bridge's synthetic loader pseudo-mods: isModLoaded('fabricloader') resolves)"],
];
CMDS["fb why automodpack"] = () => [
  ["c-hl", "automodpack — degraded (partly failed)"],
  ["c-warn", "main entrypoint 'FabricInit::onInitialize' failed, mod may be partially active:"],
  ["c-muted", "  NoClassDefFoundError: net/minecraft/class_310 — client Minecraft class, absent on servers."],
  ["c-ok", "Players still connect normally; only the sync entrypoint is unavailable here."],
];
CMDS["fb why"] = null;   // generic probe — handled specially in runCmd
CMDS["fb mods"] = () => [
  ["c-hl", "/fb mods — page 1 of 3 (41 records)"],
  ["c-ok", "fabric-api — fully active (5 module families degraded)"],
  ["c-ok", "lithium — fully active"],
  ["c-ok", "c2me — fully active (mixin families bridged)"],
  ["c-ok", "krypton — fully active"],
  ["c-warn", "architectury — degraded (partly failed) — see fb why architectury"],
  ["c-warn", "ftbessentials — degraded (partly failed) — see fb why ftbessentials"],
  ["c-dim", "/fb mods 2 · /fb mods 3 …"],
];
CMDS["fb skipped"] = () => [
  ["c-hl", "Skipped mixins (10) — feature switched off, vanilla path continues."],
  ["c-muted", "[architectury] MixinServerLevel (structural: @Shadow field entityManager missing on ServerLevel)"],
  ["c-muted", "[fabric-lifecycle-events-v1] ChunkHolderMixin (structural: @Shadow field oldTicketLevel missing)"],
  ["c-muted", "[fabric-transfer-api-v1] AbstractFurnaceBlockEntityMixin (injection drift: getTotalCookTime)"],
  ["c-muted", "[ftbessentials] PlayerListAccess (accessor member 'stats' not found)"],
  ["c-warn", "Skipped mixins are recorded with a reason and don't crash; calls fall back to vanilla paths."],
];
CMDS["fb failedmixins"] = () => [
  ["c-ok", "0 — Mixin itself did not fail on any class this session."],
];
CMDS["fb failures"] = () => [
  ["c-warn", "Failures (1 of 7 shown on this entry; 7 total recorded in calm records):"],
  ["c-muted", "[axiom] main entrypoint NCDF — client-only class needed (neutralized)"],
  ["c-dim", "Full text: fb why &lt;mod&gt; for each."],
];
CMDS["fb notloaded"] = () => [
  ["c-hl", "Not loaded (2):"],
  ["c-bad", "viabackwards — requires 'viafabric' but it is not installed"],
  ["c-bad", "viaversion — requires 'viafabric' but it is not installed"],
  ["c-dim", "Dependency problems are stated as sentences; the mod list is checked before any class loads."],
];
CMDS["fb help"] = () => [
  ["c-hl", "/fb — FabricBridge console"],
  ["c-accent", "  fb status — session overview"],
  ["c-accent", "  fb mods [page] — one line per mod with its state"],
  ["c-accent", "  fb degraded / fb notloaded — mods that partially loaded or didn't load"],
  ["c-accent", "  fb why &lt;mod&gt; — full detail for one mod"],
  ["c-accent", "  fb skipped / failedmixins / failures [page] — mixin reports"],
  ["c-accent", "  fb help — this list"],
  ["c-dim", "Extra demo commands: whoami · clear · stop"],
];
CMDS["whoami"] = () => [
  ["c-ok", "thatonemcalt"],
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
    const alias = { "architectury": "fb why architectury", "jamlib": "fb why jamlib", "automodpack": "fb why automodpack" }[mod];
    if (alias) { for (const [cls, text] of CMDS[alias]()) println(cls, text); }
    else if (!mod) println("c-dim", 'Usage: <span class="c-input">fb why &lt;mod&gt;</span> — demo probes available: architectury · jamlib · automodpack.');
    else println("c-warn", `FabricBridge would probe its records for '${esc(mod)}' now — on a real server you'd get its full report. Demo probes: architectury · jamlib · automodpack.`);
    return;
  }
  const fn = CMDS[key];
  if (!fn) return;
  for (const [cls, text] of fn()) println(cls, text);
}

/* pre-seed console */
for (const [cls, text] of BOOT_HEADER) println(cls, text);
println("c-muted", '› click a chip, or type <span class="c-input">fb status</span> and hit enter');

termIn?.addEventListener("keydown", e => {
  if (e.key === "Enter") { runCmd(termIn.value); termIn.value = ""; }
  else if (e.key === "ArrowUp") { if (histPos > 0) termIn.value = history[--histPos] || ""; e.preventDefault(); }
  else if (e.key === "ArrowDown") { if (histPos < history.length) termIn.value = history[++histPos] || ""; e.preventDefault(); }
});
termOut?.addEventListener("click", () => termIn.focus());
document.querySelectorAll(".term-chips .chip").forEach(c => c.addEventListener("click", () => { runCmd(c.dataset.cmd); termIn.focus(); }));

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
  if (ticking) return;
  ticking = true;
  /* rAF is paused while the document is hidden (background tab, embedded preview);
     falling through to a plain call keeps the pinned stages on the real scroll position */
  if (document.hidden) update(); else requestAnimationFrame(update);
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) update(); });

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
      /* hard switch, never a crossfade: the captions share one grid cell, so any
         overlap paints two of them on top of each other, and a scroll that stops
         inside the fade leaves both readable */
      const on = p >= A[i] && (i === A.length - 1 || p < A[i + 1]);
      b.style.opacity = on ? 1 : 0;
      b.style.visibility = on ? "visible" : "hidden";
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
  const AGENT = "-javaagent:plugins/FabricBridge.jar -jar server.jar";
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
      /* hard switch, never a crossfade: the captions share one grid cell, so any
         overlap paints two of them on top of each other, and a scroll that stops
         inside the fade leaves both readable */
      const on = p >= A[i] && (i === A.length - 1 || p < A[i + 1]);
      b.style.opacity = on ? 1 : 0;
      b.style.visibility = on ? "visible" : "hidden";
    });

    if (hint) hint.style.opacity = p > .06 ? 0 : .8;
  });
}

/* ═══════════ story 3 — boot console (scrub + optional auto-boot) ═══════════ */
const BOOT_LINES = [
  { st: 0, cls: "c-muted",  text: "$ java -javaagent:plugins/FabricBridge.jar -jar server.jar nogui" },
  { st: 0, cls: "",         text: "Starting the Paper / Purpur server." },
  { st: 1, cls: "c-accent", text: "[FabricBridge] Deployed jar: FabricBridge.jar" },
  { st: 1, cls: "",         text: "[FabricBridge] Fabric mods: 50 discovered, 41 loadable" },
  { st: 1, cls: "",         text: "[FabricBridge] Mappings: 7163 classes · runtime=Mojang" },
  { st: 2, cls: "c-accent", text: "[FabricBridge] Fabric runtime ready: 41 mods, 37 mixin configs, 273 access-widened classes" },
  { st: 2, cls: "c-muted",  text: "Verifying mixin targets against the live server classes." },
  { st: 2, cls: "",         text: "[FabricBridge] Classes remapped: 465, mixin-transformed: 163, access-widened: 193" },
  { st: 2, cls: "c-warn",   text: "[architectury] Skipping mixin MixinServerLevel (structural: @Shadow field entityManager not found)" },
  { st: 3, cls: "c-accent", text: "[FabricBridge] Main initializers finished" },
  { st: 3, cls: "",         text: "[FabricBridge] Mod initializers finished" },
  { st: 3, cls: "",         text: "[FabricBridge] FabricBridge boot summary: 41 mods active, degradation families: fabric-api×5, architectury, ftbessentials" },
  { st: 4, cls: "c-muted",  text: "Starting world. Preparing spawn area: 1 of 12." },
  { st: 4, cls: "",         text: "Preparing spawn area: 90%" },
  { st: 5, cls: "c-ok",     text: "Done (30.855s)! For help, type &quot;help&quot;" },
  { st: 5, cls: "c-muted",  text: "Mods listed as degraded finished boot without their failing part. /fb why &lt;mod&gt; explains." },
];

const bootStoryEl = document.querySelector('[data-story="boot"]');
const bootLines = document.getElementById("bootLines");
const bootFill = document.getElementById("bootBarFill");
const bootStages = [...document.querySelectorAll("#bootStages .bs")];
const bootBtn = document.getElementById("bootBtn");
const HINT_HTML = '<span class="ln c-dim">scroll to boot — each line arrives as you move down…</span>';
if (bootLines) bootLines.innerHTML = HINT_HTML;

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
bootBtn?.addEventListener("click", () => {
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
} else if (bootStoryEl && bootLines) {
  /* reduced motion or no scrub: render the finished boot statically */
  bootRender(1);
  if (bootBtn) bootBtn.style.display = "none";
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
