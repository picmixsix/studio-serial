// Video uji tanpa suara: node test/frames.mjs <outDir>   (butuh Playwright + ffmpeg). Meniru cara VideoComp menggambar adegan.
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { artInner, svgDoc, hud, extras, subtitle } from '../src/art/index.js'
import { uid } from '../src/art/util.js'
import { parseNarasi } from '../src/lib/parse.js'
const out = process.argv[2] || 'out'
fs.mkdirSync(out + '/f', { recursive: true })
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || 'playwright')
const { header, scenes } = parseNarasi(fs.readFileSync(new URL('./contoh.txt', import.meta.url), 'utf8'))
const FPS = 12, DUR = scenes.map((s, i) => (i === scenes.length - 1 ? 4.2 : 3.2))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 540, height: 960 } })
await page.setContent('<body style="margin:0;background:#000"><div id=a style="position:absolute;inset:0"></div></body>')
let n = 0
for (let i = 0; i < scenes.length; i++) {
  const frames = Math.round(DUR[i] * FPS)
  for (let f = 0; f < frames; f++) {
    const lf = f / FPS, p = f / frames, sc = scenes[i]
    const inner = artInner(sc, { t: lf, ta: lf, header, cam: { kind: sc.kamera, p } }) + hud(header, uid()) +
      extras(sc, header, { index: i, p: Math.min(1, Math.max(0, (lf - 0.7) / 1.3)) }) + (sc.cta ? '' : subtitle(sc.text))
    await page.evaluate(h => { document.getElementById('a').innerHTML = h }, svgDoc(inner, { sized: 'fill' }))
    await page.screenshot({ path: `${out}/f/${String(n++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 85 })
  }
}
await browser.close()
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${out}/f/%05d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${out}/demo.mp4`])
console.log('selesai', n, 'frame ->', `${out}/demo.mp4`)
