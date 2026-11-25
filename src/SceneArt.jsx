import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { renderArt } from './art/index.js'

export const SceneArt = ({ scene, header }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return <div style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: renderArt(scene, { t: frame / fps, header }) }} />
}
