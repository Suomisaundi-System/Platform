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
