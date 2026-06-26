/**
 * generate-favicons.mjs
 * ---------------------
 * Generates all favicon PNG variants + favicon.ico from public/favicon.svg
 * Run once: node generate-favicons.mjs
 *
 * Requires: npm install --save-dev sharp
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const INPUT_SVG = path.join(PUBLIC, 'favicon.svg');
const INPUT_LOGO = path.join(PUBLIC, 'logo.png');

if (!fs.existsSync(INPUT_SVG)) {
  console.error('❌  public/favicon.svg not found');
  process.exit(1);
}

const tasks = [
  // Standard favicons
  { src: INPUT_SVG, out: 'favicon-16x16.png',         size: 16  },
  { src: INPUT_SVG, out: 'favicon-32x32.png',         size: 32  },
  { src: INPUT_SVG, out: 'favicon-48x48.png',         size: 48  },

  // Apple Touch Icon (180×180 recommended)
  { src: INPUT_SVG, out: 'apple-touch-icon.png',      size: 180 },

  // Android / PWA icons
  { src: INPUT_SVG, out: 'android-chrome-192x192.png', size: 192 },
  { src: INPUT_SVG, out: 'android-chrome-512x512.png', size: 512 },

  // OG image uses logo.png at larger size (fallback if pairley_card_bg.png unavailable)
  { src: INPUT_LOGO, out: 'og-logo.png',               size: 400 },
];

async function generatePNGs() {
  for (const task of tasks) {
    const outPath = path.join(PUBLIC, task.out);
    await sharp(task.src)
      .resize(task.size, task.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`✅  Generated ${task.out} (${task.size}×${task.size})`);
  }
}

async function generateICO() {
  // ICO format: embed 16, 32, and 48px PNG layers
  // Sharp doesn't natively write .ico, so we create a minimal ICO file
  // by combining the 16px and 32px PNGs into a valid ICO binary.
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(INPUT_SVG)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  const icoBuffer = createICO(pngBuffers, sizes);
  const icoPath = path.join(PUBLIC, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('✅  Generated favicon.ico (16×16 + 32×32 + 48×48)');
}

/**
 * Build a minimal, valid ICO file from PNG buffers.
 * ICO spec: https://en.wikipedia.org/wiki/ICO_(file_format)
 */
function createICO(pngBuffers, sizes) {
  const numImages = pngBuffers.length;

  // ICONDIR header: 6 bytes
  // ICONDIRENTRY per image: 16 bytes each
  // Then the PNG data
  const headerSize = 6 + numImages * 16;
  let dataOffset = headerSize;

  const parts = [];
  const entries = [];

  for (let i = 0; i < numImages; i++) {
    const buf = pngBuffers[i];
    const size = sizes[i];
    entries.push({ size, dataOffset, dataLength: buf.length });
    parts.push(buf);
    dataOffset += buf.length;
  }

  // Build ICONDIR
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);        // Reserved, must be 0
  header.writeUInt16LE(1, 2);        // Type: 1 = ICO
  header.writeUInt16LE(numImages, 4); // Number of images

  // Build ICONDIRENTRY list
  const entryBuffers = entries.map(({ size, dataOffset: offset, dataLength }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size === 256 ? 0 : size, 0);  // Width (0 means 256)
    e.writeUInt8(size === 256 ? 0 : size, 1);  // Height
    e.writeUInt8(0, 2);                         // Color palette size (0 = no palette)
    e.writeUInt8(0, 3);                         // Reserved
    e.writeUInt16LE(1, 4);                      // Color planes
    e.writeUInt16LE(32, 6);                     // Bits per pixel
    e.writeUInt32LE(dataLength, 8);             // Size of image data
    e.writeUInt32LE(offset, 12);               // Offset of image data
    return e;
  });

  return Buffer.concat([header, ...entryBuffers, ...parts]);
}

async function main() {
  console.log('🎨  Generating Pairley favicons...\n');
  await generatePNGs();
  await generateICO();
  console.log('\n🎉  All favicons generated in /public — copy them to /dist/public for production!');
}

main().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
