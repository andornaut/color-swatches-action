import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { deflateSync } from "zlib";

const args = process.argv.slice(2);
let format = "svg";

const formatIdx = args.indexOf("--format");
if (formatIdx !== -1) {
  format = args[formatIdx + 1];
  if (format !== "svg" && format !== "png") {
    console.error("Error: --format must be 'svg' or 'png'");
    process.exit(1);
  }
  args.splice(formatIdx, 2);
}

const outDir = args[0];
if (!outDir) {
  console.error("Usage: node color-swatches.mjs [--format svg|png] <out-dir> [file...]");
  process.exit(1);
}

const files = args.slice(1);
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

function createSvg(r, g, b, a) {
  const rgb = `${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  const opacity = a < 255 ? parseFloat((a / 255).toFixed(4)) : 1;
  const opacityAttr = opacity < 1 ? ` opacity="${opacity}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" rx="3" fill="#${rgb}"${opacityAttr} stroke="#555" stroke-width="1"/></svg>`;
}

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([typeBytes, data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, checksum]);
}

function createPng(width, height, r, g, b, a) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  const ihdr = pngChunk("IHDR", ihdrData);

  const rowLen = width * 4 + 1;
  const raw = Buffer.alloc(rowLen * height);
  for (let y = 0; y < height; y++) {
    const offset = y * rowLen;
    raw[offset] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 4;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }
  const idat = pngChunk("IDAT", deflateSync(raw));
  const iend = pngChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

for (const hex of colors) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) : 255;

  const path = `${outDir}/${hex}.${format}`;
  if (format === "png") {
    writeFileSync(path, createPng(16, 16, r, g, b, a));
  } else {
    writeFileSync(path, createSvg(r, g, b, a));
  }
  console.log(path);
}

console.log(`Generated ${colors.size} ${format.toUpperCase()} swatches in ${outDir}/`);
