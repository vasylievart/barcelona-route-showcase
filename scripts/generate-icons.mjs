// scripts/generate-icons.mjs
//
// Generates the PWA icons from one SVG.
// Usage: node scripts/generate-icons.mjs
// Requires: npm i -D sharp
//
// Output (public/icons):
//   icon-{size}x{size}.png        rounded "any" icons
//   icon-maskable-{192,512}.png   full-bleed icons for Android adaptive/maskable
//                                 (the OS applies its own mask, so NO rounded corners)

import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const OUT_DIR = 'public/icons'
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const MASKABLE_SIZES = [192, 512]

const NAVY = '#1B2B4B'
const CREAM = '#FAF7F2'
const TERRACOTTA = '#C4622D'

// FIX 2: font fallbacks. sharp uses the fonts installed on THIS machine,
// so the icon can look different on another computer. Generate once and commit the PNGs.
const FONT = "Georgia, 'Times New Roman', serif"

// `scale` shrinks the content toward the center, so it stays inside
// the maskable "safe zone" (the middle ~80% of the icon).
function buildSvg({ rounded, scale }) {
  const rx = rounded ? 80 : 0 // FIX 1: no rounded corners on maskable icons
  const t = (1 - scale) * 256
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${rx}" fill="${NAVY}"/>
  <g transform="translate(${t} ${t}) scale(${scale})">
    <text x="256" y="200" text-anchor="middle"
          font-family="${FONT}" font-size="180" font-weight="bold" fill="${CREAM}">B</text>
    <text x="256" y="380" text-anchor="middle"
          font-family="${FONT}" font-size="80" fill="${TERRACOTTA}">route</text>
  </g>
</svg>`
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  const anySvg = Buffer.from(buildSvg({ rounded: true, scale: 1 }))
  const maskableSvg = Buffer.from(buildSvg({ rounded: false, scale: 0.8 }))

  for (const size of SIZES) {
    await sharp(anySvg).resize(size, size).png().toFile(`${OUT_DIR}/icon-${size}x${size}.png`)
    console.log(`✓ icon-${size}x${size}.png`)
  }

  for (const size of MASKABLE_SIZES) {
    await sharp(maskableSvg)
      .resize(size, size)
      .png()
      .toFile(`${OUT_DIR}/icon-maskable-${size}x${size}.png`)
    console.log(`✓ icon-maskable-${size}x${size}.png`)
  }

  console.log('Icons generated!')
}

// FIX 3: a failed run must not look like a success (exit code 1)
main().catch((err) => {
  console.error('Icon generation failed:', err)
  process.exitCode = 1
})