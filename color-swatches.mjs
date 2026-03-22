import { readFileSync, mkdirSync, writeFileSync } from "fs";

const outDir = process.argv[2];
if (!outDir) {
  console.error("Usage: node color-swatches.mjs <out-dir> [file...]");
  process.exit(1);
}

const files = process.argv.slice(3);
if (files.length === 0) {
  console.error("Error: at least one file is required");
  process.exit(1);
}

const hexPattern = /(?<=["'`\s]|^)#([0-9a-fA-F]{3,8})\b/gm;
const colors = new Set();

function expand(hex) {
  if (hex.length === 3) return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length === 4) return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  return hex;
}

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf-8");
  } catch (err) {
    console.error(`Error: cannot read file '${file}': ${err.message}`);
    process.exit(1);
  }
  for (const match of content.matchAll(hexPattern)) {
    const raw = match[1].toLowerCase();
    if (raw.length === 5 || raw.length === 7) continue;
    const expanded = expand(raw);
    colors.add(expanded);
  }
}

mkdirSync(outDir, { recursive: true });

for (const hex of colors) {
  const rgb = hex.slice(0, 6);
  const alpha = hex.length === 8 ? hex.slice(6) : "ff";
  const opacity = parseFloat((parseInt(alpha, 16) / 255).toFixed(4));
  const opacityAttr = opacity < 1 ? ` opacity="${opacity}"` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" rx="3" fill="#${rgb}"${opacityAttr} stroke="#555" stroke-width="1"/></svg>`;
  const path = `${outDir}/${hex}.svg`;
  writeFileSync(path, svg);
  console.log(path);
}

console.log(`Generated ${colors.size} swatches in ${outDir}/`);
