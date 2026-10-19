/* Draw the Contact Path install icons. Original geometry, no vendor mark. */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "campus", "icons");
mkdirSync(dir, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

function png(size, paint) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = paint(x + 0.5, y + 0.5, size);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function disc(x, y, cx, cy, radius) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function paint(x, y, size, pad) {
  const bg = [46, 16, 101, 255];
  const ink = [196, 122, 58, 255];
  const eye = [34, 211, 238, 255];
  const pupil = [18, 8, 32, 255];
  const u = x / size;
  const v = y / size;
  if (u < pad || v < pad || u > 1 - pad || v > 1 - pad) return bg;
  const cx = size / 2;
  const cy = size * 0.56;
  const head = size * 0.22;
  if (disc(x, y, size * 0.28, size * 0.4, size * 0.1)) return ink;
  if (disc(x, y, size * 0.72, size * 0.4, size * 0.1)) return ink;
  if (disc(x, y, cx, cy, head)) {
    if (disc(x, y, cx - head * 0.38, cy - head * 0.05, head * 0.16)) return pupil;
    if (disc(x, y, cx + head * 0.38, cy - head * 0.05, head * 0.16)) return pupil;
    if (disc(x, y, cx - head * 0.38, cy - head * 0.08, head * 0.07)) return eye;
    if (disc(x, y, cx + head * 0.38, cy - head * 0.08, head * 0.07)) return eye;
    return ink;
  }
  return bg;
}

writeFileSync(join(dir, "icon-192.png"), png(192, (x, y, size) => paint(x, y, size, 0)));
writeFileSync(join(dir, "icon-512.png"), png(512, (x, y, size) => paint(x, y, size, 0)));
writeFileSync(join(dir, "icon-maskable-512.png"), png(512, (x, y, size) => paint(x, y, size, 0.1)));
console.log("wrote campus/icons");
