import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const logoPath = path.join(publicDir, "logo.svg");

if (!fs.existsSync(logoPath)) {
  throw new Error(`Logo source not found: ${logoPath}`);
}

const icoSizes = [16, 32, 48, 256];
const pngBuffers = await Promise.all(
  icoSizes.map(async (size) => {
    const buffer = await sharp(logoPath).resize(size, size).png().toBuffer();
    if (size === 256) fs.writeFileSync(path.join(publicDir, "icon-256.png"), buffer);
    return buffer;
  }),
);

const androidIcon = await sharp(logoPath).resize(512, 512).png().toBuffer();
fs.writeFileSync(path.join(publicDir, "icon.png"), androidIcon);

const ico = await pngToIco(pngBuffers);
fs.writeFileSync(path.join(publicDir, "icon.ico"), ico);
fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico);

console.log("Generated PNG icons and multi-resolution icon.ico from public/logo.svg");
