// Dev-time: genera img/og-preview.png (1200x630 RGBA, PNG puro sin dependencias).
// Uso: node scripts/gen-og-preview.js
const fs = require('fs');
const zlib = require('zlib');

const W = 1200, H = 630;
const buf = Buffer.alloc(W * H * 4);

function px(x, y, r, g, b) {
  const i = (y * W + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
}

// Fondo cream #FAF7F2
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px(x, y, 250, 247, 242);

// Banda terracota #C4592B
for (let y = 368; y < 414; y++) for (let x = 0; x < W; x++) px(x, y, 196, 89, 43);

// Círculo sage #9AA88F
const cx1 = 900, cy1 = 250, r1 = 92;
const cx2 = 820, cy2 = 210, r2 = 42;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const d1 = Math.hypot(x - cx1, y - cy1), d2 = Math.hypot(x - cx2, y - cy2);
    if (d2 <= r2) px(x, y, 196, 89, 43);            // círculo terracota chico
    else if (d1 <= r1) px(x, y, 154, 168, 143);     // círculo sage
  }
}

// Franja inferior fina sage
for (let y = 520; y < 528; y++) for (let x = 0; x < W; x++) px(x, y, 154, 168, 143);

// ---- encoder PNG (8-bit RGBA) ----
function crc32(b) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < b.length; i++) crc = table[(crc ^ b[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 6;  // color type RGBA
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0; // filter none
  buf.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
]);

const out = 'img/og-preview.png';
fs.writeFileSync(out, png);
console.log(out, png.length, 'bytes', W + 'x' + H);