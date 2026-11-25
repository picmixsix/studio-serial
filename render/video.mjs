// node render/video.mjs <timeline.json> <out.mp4> <publicDir>
import fs from 'node:fs'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition, ensureBrowser } from '@remotion/renderer'

const [, , timelineFile, out, publicDir] = process.argv
const inputProps = JSON.parse(fs.readFileSync(timelineFile, 'utf8'))
await ensureBrowser()
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.jsx'), publicDir: path.resolve(publicDir) })
const composition = await selectComposition({ serveUrl, id: 'Video', inputProps })
let last = -1
await renderMedia({
  composition, serveUrl, inputProps, codec: 'h264', outputLocation: out, crf: 24, pixelFormat: 'yuv420p', audioBitrate: '160k',
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.error(`video ${p * 10}%`) } },
})
