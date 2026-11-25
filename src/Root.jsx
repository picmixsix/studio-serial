import React from 'react'
import { Composition } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Poppins'
import { SceneArt } from './SceneArt.jsx'
import { VideoComp } from './VideoComp.jsx'

loadFont('normal', { weights: ['600', '800'], subsets: ['latin'] })

const demoScene = { index: 0, text: '', latar: 'ruang-tamu', tokoh: { pose: 'berdiri', ekspresi: 'biasa' }, posisi: 'kiri', ukuran: 'sedang', objek: [], efek: [] }

export const Root = () => (
  <>
    {/* Satu gambar adegan (tanpa judul/HUD/subtitle), dirender sebagai PNG 1080x1920 */}
    <Composition id="SceneArt" component={SceneArt} durationInFrames={60} fps={30} width={1080} height={1920}
      defaultProps={{ scene: demoScene, header: {} }} />
    {/* Video akhir: durasi ditentukan timeline.json lewat calculateMetadata */}
    <Composition id="Video" component={VideoComp} durationInFrames={90} fps={30} width={1080} height={1920}
      defaultProps={{ totalFrames: 90, fps: 30, header: {}, music: null, scenes: [] }}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, props.totalFrames), fps: props.fps || 30 })} />
  </>
)
