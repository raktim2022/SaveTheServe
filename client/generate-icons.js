const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Medical shield SVG template with #16A34A background and STS text
const getSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#16A34A"/>
  <g transform="translate(${size * 0.25}, ${size * 0.2})">
    <path d="M ${size * 0.25} 0 L ${size * 0.5} ${size * 0.1} L ${size * 0.5} ${size * 0.35} C ${size * 0.5} ${size * 0.5} ${size * 0.35} ${size * 0.6} ${size * 0.25} ${size * 0.7} C ${size * 0.15} ${size * 0.6} 0 ${size * 0.5} 0 ${size * 0.35} L 0 ${size * 0.1} Z" fill="white"/>
    <text x="${size * 0.25}" y="${size * 0.4}" font-family="sans-serif" font-size="${size * 0.15}" font-weight="bold" fill="#16A34A" text-anchor="middle" dominant-baseline="central">STS</text>
  </g>
</svg>
`;

async function generateIcons() {
  const sizes = [192, 512];
  
  for (const size of sizes) {
    const svgBuffer = Buffer.from(getSvg(size));
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    await sharp(svgBuffer)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${outputPath}`);
  }

  // Generate apple-touch-icon.png (180x180)
  const appleSize = 180;
  const appleSvgBuffer = Buffer.from(getSvg(appleSize));
  const appleOutputPath = path.join(__dirname, 'public', 'apple-touch-icon.png');
  
  await sharp(appleSvgBuffer)
    .png()
    .toFile(appleOutputPath);
  console.log(`Generated ${appleOutputPath}`);
}

generateIcons().catch(console.error);
