import fs from "fs";
import zlib from "zlib";

// CRC32 implementation for PNG chunks
function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(size) {
  const width = size;
  const height = size;

  // Raw uncompressed scanlines: each line starts with 1 filter byte (0 = None)
  const lineSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * lineSize);

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineSize;
    rawData[lineOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 4;

      // Distance from center for rounded squircle
      const r = size * 0.22;
      const margin = size * 0.04;
      const innerW = width - 2 * margin;
      const innerH = height - 2 * margin;

      // Background gradient: #4F46E5 (R:79, G:70, B:229) -> #06B6D4 (R:6, G:182, B:212)
      const gradFactor = (x + y) / (width + height);
      const bgR = Math.round(79 * (1 - gradFactor) + 6 * gradFactor);
      const bgG = Math.round(70 * (1 - gradFactor) + 182 * gradFactor);
      const bgB = Math.round(229 * (1 - gradFactor) + 212 * gradFactor);

      // Check if inside document shape
      const docLeft = width * 0.25;
      const docRight = width * 0.75;
      const docTop = height * 0.2;
      const docBottom = height * 0.8;
      const foldSize = width * 0.15;

      const inDoc = x >= docLeft && x <= docRight && y >= docTop && y <= docBottom;
      const inFoldCorner = x > docRight - foldSize && y < docTop + foldSize;

      // Circle badge for upload (bottom right of document)
      const badgeCenterX = width * 0.68;
      const badgeCenterY = height * 0.68;
      const badgeRadius = width * 0.14;
      const distBadge = Math.hypot(x - badgeCenterX, y - badgeCenterY);
      const inBadge = distBadge <= badgeRadius;

      if (inBadge) {
        // Cyan / Sky Blue badge
        rawData[pxOffset] = 6;      // R
        rawData[pxOffset + 1] = 182; // G
        rawData[pxOffset + 2] = 212; // B
        rawData[pxOffset + 3] = 255; // A
      } else if (inDoc && !inFoldCorner) {
        // Document body: White
        // Add some document line placeholders
        const isLine1 = y >= height * 0.42 && y <= height * 0.45 && x >= docLeft + width * 0.08 && x <= docLeft + width * 0.25;
        const isLine2 = y >= height * 0.49 && y <= height * 0.52 && x >= docLeft + width * 0.08 && x <= docLeft + width * 0.38;
        const isLine3 = y >= height * 0.56 && y <= height * 0.59 && x >= docLeft + width * 0.08 && x <= docLeft + width * 0.32;

        if (isLine1 || isLine2 || isLine3) {
          rawData[pxOffset] = 203;     // R (#CBD5E1)
          rawData[pxOffset + 1] = 213; // G
          rawData[pxOffset + 2] = 225; // B
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = 255;     // White
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 255;
        }
      } else if (inDoc && inFoldCorner) {
        // Folded flap
        rawData[pxOffset] = 148;     // R (#94A3B8)
        rawData[pxOffset + 1] = 163; // G
        rawData[pxOffset + 2] = 184; // B
        rawData[pxOffset + 3] = 255;
      } else {
        // Background rounded box
        rawData[pxOffset] = bgR;
        rawData[pxOffset + 1] = bgG;
        rawData[pxOffset + 2] = bgB;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = makeChunk("IHDR", ihdrData);

  // IDAT (Deflate)
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", compressedData);

  // IEND
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Generate 512x512 PNG
const png512 = generatePng(512);
fs.writeFileSync("public/icon.png", png512);
console.log("✓ Created public/icon.png (512x512)");

// Generate 256x256 PNG
const png256 = generatePng(256);
fs.writeFileSync("public/icon-256.png", png256);

// Build high-res 256x256 Windows ICO (contains raw 256x256 PNG)
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type 1 = ICO
icoHeader.writeUInt16LE(1, 4); // 1 image

const icoDirEntry = Buffer.alloc(16);
icoDirEntry.writeUInt8(0, 0); // width: 0 means 256px
icoDirEntry.writeUInt8(0, 1); // height: 0 means 256px
icoDirEntry.writeUInt8(0, 2); // colors
icoDirEntry.writeUInt8(0, 3); // reserved
icoDirEntry.writeUInt16LE(1, 4); // planes
icoDirEntry.writeUInt16LE(32, 6); // bit count
icoDirEntry.writeUInt32LE(png256.length, 8); // size of image data
icoDirEntry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

const finalIco = Buffer.concat([icoHeader, icoDirEntry, png256]);
fs.writeFileSync("public/icon.ico", finalIco);
fs.writeFileSync("public/favicon.ico", finalIco);
console.log("✓ Created 256x256 public/icon.ico and public/favicon.ico");
