import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const scanRoots = ["app", "components"];
const filePattern = /\.(tsx|css)$/;
const blocked = /#[0-9a-fA-F]{3,8}\b|\bbg-white\b|\btext-slate-\d{2,3}\b|\bbg-slate-\d{2,3}\b|\bborder-slate-\d{2,3}\b/g;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, files);
    } else if (filePattern.test(full)) {
      files.push(full);
    }
  }
  return files;
}

const failures = [];

for (const scanRoot of scanRoots) {
  const dir = join(root, scanRoot);
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, idx) => {
      const matches = line.match(blocked);
      if (matches) {
        failures.push(`${relative(root, file)}:${idx + 1}: ${matches.join(", ")}`);
      }
    });
  }
}

if (failures.length) {
  console.error("Theme token check failed. Use semantic CSS variables instead of hardcoded colors:");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Theme token check passed.");

