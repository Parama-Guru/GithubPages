// Main-thread smoothness of the 3D journey: long tasks, long animation frames and frame times while the wheel scrolls
// through every chapter and back, after the world is ready.
// Usage: node tools/scroll-perf.mjs [baseUrl] [width] [height] [cpuThrottle] [--profile] [--boot]
//   --profile  adds the functions with the most self time while scrolling (CDP sampling profiler)
//   --boot     also reports the long tasks from navigation until the world is ready
import { chromium } from "@playwright/test";

const flags = process.argv.slice(2).filter((arg) => arg.startsWith("--"));
const [base = "http://127.0.0.1:4173/GithubPages/ge/", width = "1440", height = "900", rate = "1"] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const viewport = { width: Number(width), height: Number(height) };
const throttle = Number(rate);

const browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : undefined, args: ["--ignore-gpu-blocklist", "--enable-gpu"] });
const page = await browser.newPage({ viewport, hasTouch: false });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
const cdp = await page.context().newCDPSession(page);
if (flags.includes("--boot") && throttle > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });

// Observers are installed before any page script so that boot tasks can be reported too.
await page.addInitScript(() => {
  const state = { tasks: [], loaf: [], frames: [], recording: false, ready: 0 };
  Object.assign(window, { __perf: state });
  const zone = () => document.querySelector("[data-canvas]")?.dataset.zone ?? "";
  new window.PerformanceObserver((list) => {
    for (const entry of list.getEntries()) state.tasks.push({ start: Math.round(entry.startTime), duration: Math.round(entry.duration), zone: zone() });
  }).observe({ type: "longtask", buffered: true });
  try {
    new window.PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        state.loaf.push({
          start: Math.round(entry.startTime),
          duration: Math.round(entry.duration),
          blocking: Math.round(entry.blockingDuration),
          style: Math.round(entry.styleAndLayoutStart ? entry.startTime + entry.duration - entry.styleAndLayoutStart : 0),
          scripts: entry.scripts.map((script) => ({
            name: `${script.invoker} ${script.sourceFunctionName || "?"} ${(script.sourceURL || "").split("/").pop()}:${script.sourceCharPosition}`,
            duration: Math.round(script.duration),
            forced: Math.round(script.forcedStyleAndLayoutDuration),
          })),
        });
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch {
    // Long animation frames are Chromium-only.
  }
  let last = 0;
  const loop = (now) => {
    if (state.recording && last) state.frames.push(now - last);
    last = now;
    window.requestAnimationFrame(loop);
  };
  window.requestAnimationFrame(loop);
});

const profiling = flags.includes("--profile");
const startProfile = async () => {
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval", { interval: 250 });
  await cdp.send("Profiler.start");
};
/** Busy stretches of the main thread longer than 50 ms in a CPU profile, with the functions taking most of each. */
const profileTasks = (profile) => {
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  const parent = new Map();
  for (const node of profile.nodes) for (const child of node.children ?? []) parent.set(child, node.id);
  const name = (node) => `${node.callFrame.functionName || "(anonymous)"} ${node.callFrame.url.split("/").pop()}:${node.callFrame.lineNumber + 1}`;
  const runs = [];
  let run = null;
  let time = 0;
  profile.samples.forEach((id, index) => {
    const dt = (profile.timeDeltas[index + 1] ?? 0) / 1000;
    time += (profile.timeDeltas[index] ?? 0) / 1000;
    const node = nodes.get(id);
    const idle = node.callFrame.functionName === "(idle)";
    if (idle) {
      if (run && run.ms > 50) runs.push(run);
      run = null;
      return;
    }
    run ??= { at: Math.round(time), ms: 0, inclusive: new Map(), self: new Map() };
    run.ms += dt;
    run.self.set(name(node), (run.self.get(name(node)) ?? 0) + dt);
    const seen = new Set();
    for (let cursor = id; cursor !== undefined; cursor = parent.get(cursor)) {
      const key = name(nodes.get(cursor));
      if (seen.has(key)) continue;
      seen.add(key);
      run.inclusive.set(key, (run.inclusive.get(key) ?? 0) + dt);
    }
  });
  if (run && run.ms > 50) runs.push(run);
  const top = (map, count) =>
    [...map.entries()]
      .filter(([key]) => !/^\((root|program|anonymous\) :0)/.test(key))
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([key, ms]) => `${Math.round(ms)} ${key}`);
  return runs.map((item) => ({ at: item.at, ms: Math.round(item.ms), inclusive: top(item.inclusive, 14), self: top(item.self, 6) }));
};

const started = Date.now();
if (profiling && flags.includes("--boot")) await startProfile();
await page.goto(base, { waitUntil: "load" });
await page.waitForFunction(() => document.querySelector(".world")?.dataset.world === "ready", null, { timeout: 120_000 });
const boot = await page.evaluate(() => {
  const state = window.__perf;
  state.ready = window.performance.now();
  return { ready: Math.round(state.ready), tasks: state.tasks.slice(), loaf: state.loaf.slice() };
});
const bootWall = Date.now() - started;
let bootProfile;
if (profiling && flags.includes("--boot")) bootProfile = profileTasks((await cdp.send("Profiler.stop")).profile);
await page.waitForTimeout(2500);
if (!flags.includes("--boot") && throttle > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
await page.mouse.move(viewport.width * 0.72, viewport.height * 0.45);
if (profiling) await startProfile();
const mark = await page.evaluate(() => {
  const state = window.__perf;
  state.tasks.length = 0;
  state.loaf.length = 0;
  state.frames.length = 0;
  state.recording = true;
  return window.performance.now();
});

// About 1800 px/s, like a steady flick of the wheel, to the bottom and back up to the top.
const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const zones = new Set();
for (const direction of [1, -1]) {
  const deadline = Date.now() + 40_000;
  for (;;) {
    await page.mouse.wheel(0, 100 * direction);
    await page.waitForTimeout(50);
    const { y, zone } = await page.evaluate(() => ({ y: window.scrollY, zone: document.querySelector("[data-canvas]")?.dataset.zone }));
    zones.add(zone);
    if ((direction > 0 ? y >= max - 4 : y <= 4) || Date.now() > deadline) break;
  }
  await page.waitForTimeout(1200);
}

const result = await page.evaluate(() => {
  const state = window.__perf;
  state.recording = false;
  return { tasks: state.tasks.slice(), loaf: state.loaf.slice(), frames: state.frames.slice(), metrics: { ...document.querySelector("[data-canvas]")?.dataset } };
});
let hot = [];
let scrollProfile;
if (profiling) {
  const { profile } = await cdp.send("Profiler.stop");
  scrollProfile = profileTasks(profile);
  const self = new Map();
  const dt = new Map();
  profile.samples.forEach((id, index) => dt.set(id, (dt.get(id) ?? 0) + (profile.timeDeltas[index] ?? 0) / 1000));
  for (const node of profile.nodes) {
    const frame = node.callFrame;
    const key = `${frame.functionName || "(anonymous)"} ${frame.url.split("/").pop()}:${frame.lineNumber + 1}:${frame.columnNumber + 1}`;
    self.set(key, (self.get(key) ?? 0) + (dt.get(node.id) ?? 0));
  }
  hot = [...self.entries()]
    .filter(([key]) => !key.startsWith("(idle)") && !key.startsWith("(program)"))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([key, ms]) => `${ms.toFixed(1).padStart(7)} ms  ${key}`);
}

const frames = result.frames.slice().sort((a, b) => a - b);
const pct = (p) => Math.round(frames[Math.min(frames.length - 1, Math.floor(frames.length * p))] ?? 0);
const summarise = (tasks) => ({
  count: tasks.length,
  over50: tasks.filter((task) => task.duration > 50).length,
  over100: tasks.filter((task) => task.duration > 100).length,
  max: Math.max(0, ...tasks.map((task) => task.duration)),
  blocking: tasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0),
});
const scripts = new Map();
for (const frame of result.loaf) for (const script of frame.scripts) scripts.set(script.name, (scripts.get(script.name) ?? 0) + script.duration);
const report = {
  viewport: `${width}x${height}`,
  throttle,
  bootWallMs: bootWall,
  boot: flags.includes("--boot") ? { readyAt: boot.ready, ...summarise(boot.tasks), tasks: boot.tasks.filter((task) => task.duration > 50).map((task) => `${task.start}+${task.duration}`) } : undefined,
  bootLoaf: flags.includes("--boot") ? boot.loaf.filter((frame) => frame.duration > 80).map((frame) => ({ at: frame.start, ms: frame.duration, style: frame.style, scripts: frame.scripts.filter((script) => script.duration > 10) })) : undefined,
  zones: [...zones].join(","),
  scrollTasks: { ...summarise(result.tasks), list: result.tasks.map((task) => `${task.start - Math.round(mark)}ms+${task.duration}@${task.zone}`) },
  frames: { count: frames.length, over33: frames.filter((f) => f > 33.4).length, over50: frames.filter((f) => f > 50).length, p50: pct(0.5), p95: pct(0.95), p99: pct(0.99), max: Math.round(frames.at(-1) ?? 0) },
  loafScripts: [...scripts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, ms]) => `${ms} ms ${name}`),
  longFrames: result.loaf.filter((frame) => frame.duration > 50).slice(0, 12).map((frame) => ({ at: frame.start - Math.round(mark), ms: frame.duration, style: frame.style, scripts: frame.scripts.filter((script) => script.duration > 5) })),
  hot,
  bootProfile,
  scrollProfile,
  metrics: { calls: result.metrics.calls, zone: result.metrics.zone, frames: result.metrics.frames },
  errors,
};
console.log(JSON.stringify(report, null, 1));
await browser.close();
