// Render semua latar & pose ke PNG lewat Chromium (Playwright) untuk pemeriksaan visual: node test/preview.mjs <outDir>
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { renderPreview, renderArt, LATAR } from '../src/art/index.js'
import { parseNarasi } from '../src/lib/parse.js'
const out = process.argv[2] || 'out'
fs.mkdirSync(out, { recursive: true })
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || 'playwright')
const sample = fs.readFileSync(new URL('./contoh.txt', import.meta.url), 'utf8')
const { header, scenes } = parseNarasi(sample)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
const shot = async (svg, file) => {
  await page.setContent(`<body style="margin:0;background:#000"><style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap')</style>${svg}</body>`)
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${out}/${file}.png` })
}
for (let i = 0; i < scenes.length; i++) await shot(renderPreview(scenes[i], header, { index: i, count: scenes.length, sized: true }), `scene-${String(i + 1).padStart(2, '0')}`)
for (const l of LATAR) await shot(renderArt({ latar: l, tokoh: { pose: 'menunjuk', ekspresi: 'takut' }, posisi: 'kiri', ukuran: 'sedang', objek: l === 'tangga' || l === 'lorong' || l === 'luar' ? ['bayangan'] : [], efek: [] }), `latar-${l}`)
await browser.close()
console.log('selesai ->', out)
