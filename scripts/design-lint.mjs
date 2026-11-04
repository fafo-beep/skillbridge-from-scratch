#!/usr/bin/env node
// Design gate. Fails CI when generated-UI tells enter the source.
// The rules are the house style: flat colour, one blue, no ornament.
// A line that must keep a pattern for a real reason can carry the
// comment `design-lint-ignore` on the same line.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

const RULES = [
  {
    id: "emoji",
    re: /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{FE0F}]/u,
    why: "No emoji in the interface. Use words, or a plain icon with meaning.",
  },
  {
    id: "gradient",
    re: /bg-gradient-|linear-gradient|radial-gradient|conic-gradient/,
    why: "No gradients. Flat colour, or a real picture.",
  },
  {
    id: "glass",
    re: /backdrop-blur|backdrop-filter/,
    why: "No glass panels. Opaque surfaces separated by tone steps.",
  },
  {
    id: "sparkle",
    re: /\bSparkles?\b.*lucide|lucide.*\bSparkles?\b|<Sparkles/,
    why: "No sparkle icons. 'AI magic' decoration is the strongest generated-UI tell.",
  },
  {
    id: "accent-stripe",
    re: /border-l-4|border-t-4|border-l-(?:red|blue|green|amber|orange|violet|purple|emerald|pink|yellow)-\d/,
    why: "No coloured accent stripes on cards. Status belongs in a label; surfaces separate by tone.",
  },
  {
    id: "rainbow-palette",
    re: /(?:bg|text|border)-(?:violet|purple|fuchsia|pink|rose)-\d/,
    why: "Stay in the blue system (primary, accent, secondary) plus the semantic tokens.",
  },
  {
    id: "resting-shadow",
    re: /className="[^"]*\bshadow(?:-sm|-md|-lg|-xl|-2xl)?\b(?![^"]*shadow-none)/,
    why: "No shadows on things at rest. Shadows are for true overlays (menus, dialogs).",
  },
  {
    id: "raw-hex",
    re: /#[0-9a-fA-F]{6}\b(?!.*design-lint-token)/,
    why: "No raw hex colours in components. Use the tokens in globals.css.",
    files: /\.(tsx|jsx)$/,
  },
];

const root = process.argv[2] ?? "src";
const findings = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (EXTS.has(extname(p))) scan(p);
  }
}

function scan(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes("design-lint-ignore")) return;
    for (const rule of RULES) {
      if (rule.files && !rule.files.test(file)) continue;
      if (rule.re.test(line)) {
        findings.push({ file, line: i + 1, id: rule.id, why: rule.why });
      }
    }
  });
}

walk(root);

if (findings.length) {
  console.error(`DESIGN LINT — ${findings.length} finding(s):\n`);
  for (const f of findings) {
    console.error(`  [${f.id}] ${f.file}:${f.line}\n      ${f.why}\n`);
  }
  process.exit(1);
} else {
  console.log("DESIGN LINT — clean.");
}
