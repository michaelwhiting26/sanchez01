/* global process, Buffer, console, URL */
// CSS audit for the homepage stylesheet set (src/styles/home/**).
//
//   node apps/web/scripts/css-audit.mjs <files...>   report only: bytes, rules, !important, duplicated selectors per effective context (exit 0)
//   node apps/web/scripts/css-audit.mjs --check      guardrail (run by `npm run check`, so CI and the pre-push hook): exit 1 if any of
//       1. a selector is defined in more than one rule of the same effective context (same media/supports chain) in the same file: that is an
//          override stack. Change the rule where it is defined; do not add a later one. (Different media/state contexts are fine.)
//       2. an !important has no adjacent comment saying what constraint it fights (an inline style, a third-party rule), or the folder holds
//          more than MAX_IMPORTANT of them. Adjacent = a comment in the same rule directly before or after the declaration, or a comment
//          directly before the rule.
//       3. a .css file in the folder is not @imported by index.css (it would silently not ship), or index.css imports a file that is missing.
//     Reported, never failing: bytes and rule count per file (observability, not a cap: real homepage work may add rules), and classes in these
//     files that no .ts/.tsx source mentions (dynamic class names make "unused" unsafe to enforce).
//
// Scope: homepage-owned CSS only (styles/home/). base.css, bag-buttons.css and share-sheet.css belong to other owners and are not checked here.
// Needs postcss (present in the repo's node_modules through Next/Tailwind).
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const WEB = path.resolve(HERE, "..");
const HOME_DIR = path.join(WEB, "src", "styles", "home");
// The most !important declarations the homepage may carry, each one commented. Target is 0; raise only with a stated technical reason.
const MAX_IMPORTANT = 3;

const ctxOf = (rule) => {
  const ctx = [];
  for (let p = rule.parent; p && p.type !== "root"; p = p.parent) if (p.type === "atrule") ctx.unshift(`@${p.name} ${p.params}`);
  return ctx.join(" > ");
};
const inKeyframes = (rule) => rule.parent?.type === "atrule" && /keyframes/.test(rule.parent.name);

function analyse(file) {
  const css = fs.readFileSync(file, "utf8");
  const root = postcss.parse(css, { from: file });
  const seen = new Map();
  const classes = new Set();
  const important = [];
  let rules = 0;
  root.walkRules((r) => {
    if (inKeyframes(r)) return;
    rules++;
    const ctx = ctxOf(r);
    for (const sel of r.selectors) {
      const k = `${ctx} :: ${sel.replace(/\s+/g, " ").trim()}`;
      seen.set(k, (seen.get(k) ?? 0) + 1);
      for (const m of sel.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) classes.add(m[1]);
    }
    r.walkDecls((d) => {
      if (!d.important) return;
      const prev = d.prev();
      const next = d.next();
      const before = r.prev();
      const commented =
        (prev?.type === "comment" && prev.text.trim().length > 8) ||
        (next?.type === "comment" && next.text.trim().length > 8) ||
        (before?.type === "comment" && before.text.trim().length > 8);
      important.push({ selector: r.selector.replace(/\s+/g, " "), prop: d.prop, line: d.source?.start?.line ?? 0, commented });
    });
  });
  const dups = [...seen].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
  return { css, bytes: Buffer.byteLength(css), rules, important, dups, classes };
}

const args = process.argv.slice(2);
const check = args.includes("--check");

if (!check) {
  const files = args.filter((a) => !a.startsWith("--"));
  const total = { rules: 0, important: 0, bytes: 0, dupSelectors: 0, dupExtra: 0 };
  for (const f of files) {
    const a = analyse(f);
    const extra = a.dups.reduce((s, [, n]) => s + n - 1, 0);
    console.log(`${f}: ${a.bytes} B, ${a.rules} rules, ${a.important.length} !important, ${a.dups.length} duplicated selectors (${extra} extra definitions)`);
    for (const [k, n] of a.dups) console.log(`   ${n}× ${k}`);
    total.rules += a.rules; total.important += a.important.length; total.bytes += a.bytes; total.dupSelectors += a.dups.length; total.dupExtra += extra;
  }
  console.log("TOTAL", JSON.stringify(total));
  process.exit(0);
}

// ---- --check ----
const files = fs.readdirSync(HOME_DIR).filter((f) => f.endsWith(".css") && f !== "index.css").sort();
const failures = [];
const notes = [];
let importantTotal = 0;
let rulesTotal = 0;
let bytesTotal = 0;

const index = fs.readFileSync(path.join(HOME_DIR, "index.css"), "utf8");
const imported = [...index.matchAll(/@import\s+["']\.\/([^"']+)["']/g)].map((m) => m[1]);
for (const f of files) if (!imported.includes(f)) failures.push(`${f}: not @imported by styles/home/index.css, so it would not ship`);
for (const f of imported) if (!files.includes(f)) failures.push(`index.css imports ${f}, which does not exist in styles/home`);

const srcText = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) srcText.push(fs.readFileSync(p, "utf8"));
  }
};
walk(path.join(WEB, "src"));
const source = srcText.join("\n");

for (const f of files) {
  const a = analyse(path.join(HOME_DIR, f));
  rulesTotal += a.rules;
  bytesTotal += a.bytes;
  importantTotal += a.important.length;
  for (const [k, n] of a.dups) failures.push(`${f}: selector defined ${n}x in one context (override stack): ${k}`);
  for (const i of a.important) if (!i.commented) failures.push(`${f}:${i.line}: !important on "${i.selector}" { ${i.prop} } has no adjacent comment naming the constraint it fights`);
  const unused = [...a.classes].filter((c) => !source.includes(c)).sort();
  if (unused.length) notes.push(`${f}: classes no .ts/.tsx mentions (informational): ${unused.join(", ")}`);
  console.log(`  ${f.padEnd(34)} ${String(a.bytes).padStart(6)} B  ${String(a.rules).padStart(3)} rules  ${a.important.length} !important  ${a.dups.length} duplicate stacks`);
}
if (importantTotal > MAX_IMPORTANT) failures.push(`!important: ${importantTotal} in styles/home, maximum ${MAX_IMPORTANT}`);

console.log(`css-audit --check: ${files.length} files, ${bytesTotal} B, ${rulesTotal} rules, ${importantTotal} !important (max ${MAX_IMPORTANT})`);
for (const n of notes) console.log(`  note: ${n}`);
if (failures.length) {
  for (const f of failures) console.error(`  FAIL: ${f}`);
  console.error(`css-audit --check: ${failures.length} problem(s)`);
  process.exit(1);
}
console.log("css-audit --check: ok");
