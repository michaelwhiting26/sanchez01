/* global process, Buffer, console */
// Usage: node scripts/css-audit.mjs src/styles/home.css  (needs postcss from the repo root node_modules)
// Duplicate-selector audit: same selector list inside the same at-rule context (media/supports) defined in more than one rule.
import fs from "node:fs";
import postcss from "postcss";
const files = process.argv.slice(2);
let total = { rules: 0, important: 0, bytes: 0, dupSelectors: 0, dupRules: 0 };
for (const f of files) {
  const css = fs.readFileSync(f, "utf8");
  const root = postcss.parse(css, { from: f });
  const seen = new Map();
  let rules = 0, important = 0;
  root.walkRules((r) => {
    if (r.parent?.type === "atrule" && /keyframes/.test(r.parent.name)) return;
    rules++;
    const ctx = []; let p = r.parent;
    while (p && p.type !== "root") { if (p.type === "atrule") ctx.unshift(`@${p.name} ${p.params}`); p = p.parent; }
    for (const sel of r.selectors) {
      const k = ctx.join(" > ") + " :: " + sel.replace(/\s+/g, " ").trim();
      seen.set(k, (seen.get(k) ?? 0) + 1);
    }
    r.walkDecls((d) => { if (d.important) important++; });
  });
  const dups = [...seen].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
  const bytes = Buffer.byteLength(css);
  console.log(`${f}: ${bytes} B, ${rules} rules, ${important} !important, ${dups.length} duplicated selectors (${dups.reduce((s, [, n]) => s + n - 1, 0)} extra definitions)`);
  for (const [k, n] of dups.slice(0, 40)) console.log(`   ${n}× ${k}`);
  total.rules += rules; total.important += important; total.bytes += bytes; total.dupSelectors += dups.length;
}
console.log("TOTAL", JSON.stringify(total));
