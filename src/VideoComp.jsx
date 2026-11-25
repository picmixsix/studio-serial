import React from 'react'
import { AbsoluteFill, Sequence, Audio, Img, staticFile, useCurrentFrame, interpolate } from 'remotion'
import { svgDoc, hud, extras, renderArt } from './art/index.js'

const FADE = 9 // frame cross-fade antar adegan
const FONT = "Poppins, 'Segoe UI', Arial, sans-serif"
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

// p = 0..1 kemajuan adegan -> transformasi kamera (Ken Burns)
function cam(kind, p) {
  const e = p * p * (3 - 2 * p)
  switch (kind) {
    case 'zoom-in': return `scale(${1 + 0.1 * e})`
    case 'zoom-out': return `scale(${1.1 - 0.1 * e})`
    case 'geser-kiri': return `scale(1.1) translateX(${2.5 - 5 * e}%)`
    case 'geser-kanan': return `scale(1.1) translateX(${-2.5 + 5 * e}%)`
    case 'naik': return `scale(1.1) translateY(${2.5 - 5 * e}%)`
    case 'turun': return `scale(1.1) translateY(${-2.5 + 5 * e}%)`
    default: return 'scale(1)'
  }
}

const fill = svg => svg

const SceneLayer = ({ sc, header, first, fps }) => {
  const f = useCurrentFrame()
  const lf = f - (first ? 0 : FADE) // frame lokal adegan (0 = awal adegan sebenarnya)
  const lt = Math.max(0, lf) / fps
  const p = clamp(lf / Math.max(1, sc.dur), 0, 1)
  const opacity = first ? 1 : interpolate(f, [0, FADE], [0, 1], { extrapolateRight: 'clamp' })
  const pp = clamp((lt - 0.7) / 1.3, 0, 1)
  const ex = extras(sc.scene, header, { index: sc.index, p: pp })
  return (
    <AbsoluteFill style={{ opacity }}>
      {sc.image ? (
        // gambar hasil unggahan: gerak kamera sederhana (Ken Burns)
        <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
          <Img src={staticFile(sc.image)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: cam(sc.cam, p), transformOrigin: '50% 50%' }} />
        </AbsoluteFill>
      ) : (
        // render langsung: tokoh, uap, lampu, dan kamera digambar ulang tiap frame
        <AbsoluteFill dangerouslySetInnerHTML={{ __html: renderArt(sc.scene, { t: lt, ta: lt, header, cam: { kind: sc.cam, p }, sized: 'fill' }) }} />
      )}
      {ex ? <AbsoluteFill dangerouslySetInnerHTML={{ __html: svgDoc(ex, { sized: 'fill' }) }} /> : null}
    </AbsoluteFill>
  )
}

const Subtitles = ({ scenes }) => {
  const f = useCurrentFrame()
  let hit = null
  for (const sc of scenes) {
    if (sc.hideSub) continue
    for (const c of sc.subs || []) if (f >= c.start && f < c.end) hit = c
  }
  if (!hit) return null
  const o = interpolate(f, [hit.start, hit.start + 5, hit.end - 4, hit.end], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <div style={{ position: 'absolute', left: 80, right: 80, bottom: 150, textAlign: 'center', opacity: o,
      font: `600 40px/1.3 ${FONT}`, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.9)' }}>{hit.text}</div>
  )
}

export const VideoComp = ({ scenes, header, music, totalFrames, fps }) => {
  const f = useCurrentFrame()
  const gid = 'h'
  const hudSvg = svgDoc(hud(header, gid), { sized: 'fill' })
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {scenes.map((sc, i) => {
        const from = sc.start - (i > 0 ? FADE : 0)
        return (
          <Sequence key={i} from={from} durationInFrames={sc.dur + (i > 0 ? FADE : 0)}>
            <SceneLayer sc={sc} header={header} first={i === 0} fps={fps} />
          </Sequence>
        )
      })}
      <AbsoluteFill dangerouslySetInnerHTML={{ __html: hudSvg }} />
      <Subtitles scenes={scenes} />
      {scenes.map((sc, i) => sc.audio ? (
        <Sequence key={'a' + i} from={sc.start + sc.audioOffset} durationInFrames={sc.audioDur + 3}>
          <Audio src={staticFile(sc.audio)} />
        </Sequence>
      ) : null)}
      {music ? <Audio src={staticFile(music)} loop volume={fr => 0.11 * interpolate(fr, [0, 20, totalFrames - 50, totalFrames - 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} /> : null}
    </AbsoluteFill>
  )
}
