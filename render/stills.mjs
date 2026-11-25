// node render/stills.mjs <narasi.txt> <outDir>  -> adegan-01.png ... + scenes.json
import fs from 'node:fs'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { openBrowser, ensureBrowser, selectComposition, renderStill } from '@remotion/renderer'
import { parseNarasi } from '../src/lib/parse.js'

const [, , narasiFile, outDir] = process.argv
const { header, scenes, warnings } = parseNarasi(fs.readFileSync(narasiFile, 'utf8'))
if (!scenes.length) throw new Error('Narasi kosong: tidak ada adegan')
fs.mkdirSync(outDir, { recursive: true })

await ensureBrowser()
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.jsx') })
const browser = await openBrowser('chrome')
const files = []
try {
  for (const sc of scenes) {
    const inputProps = { scene: sc, header }
    const composition = await selectComposition({ serveUrl, id: 'SceneArt', inputProps, puppeteerInstance: browser })
    const name = `adegan-${String(sc.index + 1).padStart(2, '0')}.png`
    await renderStill({ composition, serveUrl, inputProps, frame: 20, imageFormat: 'png', output: path.join(outDir, name), puppeteerInstance: browser })
    files.push(name)
    console.error(`gambar ${sc.index + 1}/${scenes.length}`)
  }
} finally {
  await browser.close(true)
}
fs.writeFileSync(path.join(outDir, 'scenes.json'), JSON.stringify({ header, scenes, warnings, files }))
