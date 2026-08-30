#!/usr/bin/env node
/*
 * Tadwal Resources — static site generator.
 *
 * Assembles the plain HTML files in the project root from:
 *   - src/layout.html   (shared shell: <head>, header/nav, footer, scripts)
 *   - src/pages/*.html   (per-page <main> content + metadata comment)
 *
 * The output is committed to the repo, so the site works with or without Node.
 * Run after editing the layout or any page:
 *
 *     node build.js
 *
 * No dependencies. Node 14+.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const PAGES_DIR = path.join(SRC, "pages");

/* Single source of truth for the primary navigation. */
const NAV = [
  { label: "Home", href: "index.html", key: "home" },
  { label: "About", href: "about.html", key: "about" },
  {
    label: "Divisions",
    key: "divisions",
    children: [
      { label: "LPG &amp; Energy — Taifa Gas", href: "taifa-gas.html" },
      { label: "Dairy — Daima Milk", href: "daima-milk.html" },
      { label: "Beverages — Pepsi South Coast", href: "pepsi-south-coast.html" },
      { label: "Coatings — Ocean 53 Paints", href: "ocean-53-paints.html" },
    ],
  },
  { label: "Logistics", href: "logistics.html", key: "logistics" },
  { label: "Coverage", href: "coverage.html", key: "coverage" },
  { label: "Contact", href: "contact.html", key: "contact", cta: true },
];

const CHEVRON =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function buildNav(activeKey, base) {
  const items = NAV.map((item) => {
    if (item.children) {
      const isActive = item.key === activeKey;
      const links = item.children
        .map(
          (c) =>
            `            <li><a href="${base}${c.href}">${c.label}</a></li>`
        )
        .join("\n");
      return `        <li class="has-dropdown">
          <button class="dropdown-toggle" aria-expanded="false" aria-controls="divisions-menu"${
            isActive ? ' data-active="true"' : ""
          }>
            ${item.label}
            ${CHEVRON}
          </button>
          <ul class="dropdown" id="divisions-menu">
${links}
          </ul>
        </li>`;
    }
    const current = item.key === activeKey ? ' aria-current="page"' : "";
    const cls = item.cta ? ' class="primary-nav__cta"' : "";
    return `        <li><a href="${base}${item.href}"${cls}${current}>${item.label}</a></li>`;
  }).join("\n");

  return `<ul class="primary-nav__list">
${items}
      </ul>`;
}

/* Parse the leading  <!-- key: value -->  metadata block of a page file. */
function parseMeta(raw) {
  const meta = {};
  const match = raw.match(/^\s*<!--([\s\S]*?)-->/);
  let body = raw;
  if (match) {
    match[1]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const idx = line.indexOf(":");
        if (idx > -1) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      });
    body = raw.slice(match[0].length);
  }
  return { meta, body: body.replace(/^\s*\n/, "") };
}

function main() {
  const layout = fs.readFileSync(path.join(SRC, "layout.html"), "utf8");
  const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".html"));
  const base = ""; // all pages live at the site root

  files.forEach((file) => {
    const raw = fs.readFileSync(path.join(PAGES_DIR, file), "utf8");
    const { meta, body } = parseMeta(raw);
    if (!meta.title) {
      console.warn(`! ${file}: missing "title" metadata — skipped`);
      return;
    }

    const html = layout
      .replace(/\{\{TITLE\}\}/g, meta.title)
      .replace(/\{\{DESC\}\}/g, meta.desc || "")
      .replace(/\{\{NAV\}\}/g, buildNav(meta.active || "", base))
      .replace(/\{\{BASE\}\}/g, base)
      .replace(/\{\{CONTENT\}\}/g, body.trimEnd() + "\n");

    fs.writeFileSync(path.join(ROOT, file), html);
    console.log(`  built  ${file}`);
  });
}

main();
