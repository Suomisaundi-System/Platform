"use strict";
// Platform is the companion configuration and integration surface
// for the Suomisaundi System organization website.
// This public static site must never contain private credentials.
const config = Object.freeze({
  system: "Suomisaundi System",
  module: "Platform",
  primarySite: "https://suomisaundi-system.github.io/",
  role: "Companion platform configuration",
  status: "Foundation"
});
document.title = config.system + " — " + config.module;
const main = document.createElement("main");
main.style.cssText = "max-width:860px;margin:10vh auto;padding:24px;font:16px system-ui,sans-serif;line-height:1.6";
const heading = document.createElement("h1");
heading.textContent = config.system + " — " + config.module;
const description = document.createElement("p");
description.textContent = "Companion configuration and integration platform for the main Suomisaundi System website.";
const home = document.createElement("a");
home.href = config.primarySite;
home.textContent = "Open the main Suomisaundi System website";
main.append(heading, description, home);
document.body.append(main);

// suomisaundi-browser-capabilities-v1
// Capability discovery is non-invasive: GPU and audio activation are deferred
// until a feature explicitly requests them, respecting permissions and gestures.
export const browserCapabilities = Object.freeze({
  webAssembly: typeof WebAssembly !== "undefined",
  webGPU: typeof navigator !== "undefined" && "gpu" in navigator,
  vectorGraphics: typeof document !== "undefined" &&
    typeof document.createElementNS === "function",
  webAudio: typeof window !== "undefined" &&
    Boolean(window.AudioContext || window.webkitAudioContext)
});

export async function createWebAssemblyModule(bytes, imports = {}) {
  if (!browserCapabilities.webAssembly) throw new Error("WebAssembly unavailable");
  return WebAssembly.instantiate(bytes, imports);
}

export async function requestWebGPUDevice() {
  if (!browserCapabilities.webGPU) throw new Error("WebGPU unavailable");
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No WebGPU adapter available");
  const device = await adapter.requestDevice();
  return { adapter, device };
}

export function createSVG(width = 320, height = 180) {
  if (!browserCapabilities.vectorGraphics) throw new Error("SVG unavailable");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("role", "img");
  return svg;
}

export function createAudioContext() {
  if (!browserCapabilities.webAudio) throw new Error("Web Audio unavailable");
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  return new AudioContextClass();
}

// suomisaundi-interrepository-messaging-v1
// BroadcastChannel connects open pages under the same GitHub Pages origin.
// This is ephemeral, browser-local messaging, NOT server-side synchronization.
export const systemNode = location.pathname.split("/").filter(Boolean)[0] || "Main";
export const systemBus = typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("suomisaundi-system-v1") : null;
const systemSubscribers = new Set();
export function onSystemMessage(callback) {
  if (typeof callback !== "function") throw new TypeError("Callback required");
  systemSubscribers.add(callback);
  return () => systemSubscribers.delete(callback);
}
export function sendSystemMessage(type, payload = null, target = "*") {
  if (!systemBus) return false;
  if (typeof type !== "string" || !type || type.length > 80) throw new TypeError("Invalid message type");
  systemBus.postMessage({
    protocol: "suomisaundi-system-v1", source: systemNode,
    target, type, payload, timestamp: Date.now()
  });
  return true;
}
if (systemBus) systemBus.addEventListener("message", event => {
  const message = event.data;
  if (!message || message.protocol !== "suomisaundi-system-v1") return;
  if (message.target !== "*" && message.target !== systemNode) return;
  for (const callback of systemSubscribers) {
    try { callback(message); } catch (error) { console.error("System subscriber error", error); }
  }
});
