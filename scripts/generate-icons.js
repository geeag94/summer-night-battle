import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgBuffer = fs.readFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'));

async function generateIcons() {
  const sizes = [192, 512];
  
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '..', 'public', `icon-${size}x${size}.png`));
    
    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generateIcons().catch(console.error);
