/**
 * Draws the CodeNest app icons.
 *
 * A web app manifest needs real raster icons before a browser will offer to
 * install it, and installing is what turns "a site that works offline" into
 * "an app on the home screen that works offline".
 *
 * The icons are painted here in plain Node — a few hundred bytes of pixels and
 * a hand-rolled PNG encoder — rather than pulled from an image library, so the
 * project keeps its no-extra-dependencies character and the mark stays in step
 * with the one in the header: a white C on the Python blue/yellow diagonal.
 *
 * Run with:  pnpm icons
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "icons");

const BLUE = [0x37, 0x76, 0xab];
const YELLOW = [0xff, 0xd4, 0x3b];
const WHITE = [0xff, 0xff, 0xff];

// ------------------------------------------------------------- PNG encoding

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

/** Encodes an RGB pixel buffer as a PNG. */
function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  // 10-12: compression, filter and interlace methods — all zero (default).

  // Each scanline is prefixed with its filter type; 0 means "none".
  const stride = size * 3;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ----------------------------------------------------------------- the mark

/**
 * Coverage of the white C at a point, 0..1.
 *
 * The C is an annulus with a wedge removed on the right — the same shape the
 * header letter suggests, but drawn geometrically so it needs no font.
 */
function letterCoverage(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.3;
  const inner = size * 0.185;

  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.hypot(dx, dy);
  if (distance > outer || distance < inner) return 0;

  // Remove the opening: a wedge centred on due east.
  const angle = Math.atan2(dy, dx); // -π..π, 0 = east
  const opening = (42 * Math.PI) / 180;
  if (Math.abs(angle) < opening) return 0;

  return 1;
}

/** The diagonal blue/yellow field behind the letter. */
function background(x, y, size) {
  return (x + y) / (2 * size) < 0.45 ? BLUE : YELLOW;
}

function render(size) {
  const pixels = Buffer.alloc(size * size * 3);
  const SAMPLES = 3; // 3x3 supersampling, so the curves are not jagged

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let covered = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = x + (sx + 0.5) / SAMPLES;
          const py = y + (sy + 0.5) / SAMPLES;
          covered += letterCoverage(px, py, size);
        }
      }
      const alpha = covered / (SAMPLES * SAMPLES);

      const base = background(x, y, size);
      const offset = (y * size + x) * 3;
      for (let c = 0; c < 3; c++) {
        pixels[offset + c] = Math.round(base[c] * (1 - alpha) + WHITE[c] * alpha);
      }
    }
  }

  return encodePng(size, pixels);
}

// -------------------------------------------------------------------- write

mkdirSync(outDir, { recursive: true });

// The letter sits well inside the middle 80%, so the same square art is safe to
// declare as maskable — Android crops it to whatever shape the launcher uses.
const ICONS = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
];

for (const [name, size] of ICONS) {
  const png = render(size);
  writeFileSync(join(outDir, name), png);
  console.log(`[icons] ${name} (${size}×${size}, ${(png.length / 1024).toFixed(1)} kB)`);
}
