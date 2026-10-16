import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const size = 32;

function paint() {
  const pixels = new Uint8Array(size * size * 4);
  const set = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    pixels[i] = b;
    pixels[i + 1] = g;
    pixels[i + 2] = r;
    pixels[i + 3] = a;
  };
  const circle = (cx, cy, radius, color) => {
    const [r, g, b] = color;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        if (dx * dx + dy * dy <= radius * radius) set(x, y, r, g, b);
      }
    }
  };
  const ring = (cx, cy, radius, width, color) => {
    const [r, g, b] = color;
    const outer = radius * radius;
    const inner = (radius - width) * (radius - width);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const d = dx * dx + dy * dy;
        if (d <= outer && d >= inner) set(x, y, r, g, b);
      }
    }
  };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) set(x, y, 7, 16, 24);
  }
  circle(16, 18, 8, [196, 122, 58]);
  circle(9, 12, 3.4, [196, 122, 58]);
  circle(23, 12, 3.4, [196, 122, 58]);
  circle(13, 17.5, 1.4, [27, 18, 12]);
  circle(19, 17.5, 1.4, [27, 18, 12]);
  for (let x = 13; x <= 19; x += 1) {
    const t = (x - 16) / 3;
    const y = Math.round(21 + t * t * 2);
    set(x, y, 27, 18, 12);
    set(x, y + 1, 27, 18, 12);
  }
  ring(16, 16, 14.5, 1.4, [62, 203, 255]);
  return pixels;
}

function ico(pixels) {
  const header = 40;
  const xor = size * size * 4;
  const andRow = Math.ceil(size / 32) * 4;
  const and = andRow * size;
  const imageSize = header + xor + and;
  const offset = 6 + 16;
  const file = Buffer.alloc(offset + imageSize);
  file.writeUInt16LE(0, 0);
  file.writeUInt16LE(1, 2);
  file.writeUInt16LE(1, 4);
  file.writeUInt8(size, 6);
  file.writeUInt8(size, 7);
  file.writeUInt8(0, 8);
  file.writeUInt8(0, 9);
  file.writeUInt16LE(1, 10);
  file.writeUInt16LE(32, 12);
  file.writeUInt32LE(imageSize, 14);
  file.writeUInt32LE(offset, 18);
  const dib = offset;
  file.writeUInt32LE(40, dib);
  file.writeInt32LE(size, dib + 4);
  file.writeInt32LE(size * 2, dib + 8);
  file.writeUInt16LE(1, dib + 12);
  file.writeUInt16LE(32, dib + 14);
  file.writeUInt32LE(0, dib + 16);
  file.writeUInt32LE(xor + and, dib + 20);
  let cursor = dib + 40;
  for (let y = size - 1; y >= 0; y -= 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      file[cursor] = pixels[i];
      file[cursor + 1] = pixels[i + 1];
      file[cursor + 2] = pixels[i + 2];
      file[cursor + 3] = pixels[i + 3];
      cursor += 4;
    }
  }
  return file;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = ico(paint());
writeFileSync(join(root, "campus", "favicon.ico"), file);
writeFileSync(join(root, "favicon.ico"), file);
console.log("favicon.ico", file.length);
