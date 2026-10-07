'use client'
import { useEffect, useRef }   from 'react'
import { useSpeech }           from 'react-text-to-speech'
import ReactMarkdown           from 'react-markdown'
import remarkGfm               from 'remark-gfm'
import type { GuideStop }      from '@/types/guide'
import './stop-dialog.css'

interface Props {
  stop:     GuideStop
  index:    number
  onClose:  () => void
}

// Strip markdown syntax for clean TTS reading
// **bold** → bold, # heading → heading, bullet points → readable text
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')          // headings
    .replace(/\*\*(.*?)\*\*/g, '$1')    // bold
    .replace(/\*(.*?)\*/g, '$1')        // italic
    .replace(/~~(.*?)~~/g, '$1')        // strikethrough
    .replace(/`(.*?)`/g, '$1')          // inline code
    .replace(/^\s*[-·•]\s+/gm, '')      // bullet points
    .replace(/^\s*\d+\.\s+/gm, '')      // numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links → just the text
    .replace(/>/g, '')                   // blockquotes
    .replace(/\n{2,}/g, '. ')           // paragraph breaks → pause
    .replace(/\n/g, ' ')                // single line breaks
    .trim()
}

export function StopDialog({ stop, index, onClose }: Props) {
  const dialogRef  = useRef<HTMLDivElement>(null)
  const cleanText  = stripMarkdown(
    `Stop ${index}. ${stop.name}. ${stop.description ?? ''} ${stop.local_tip ? `Local tip: ${stop.local_tip}` : ''}`
  )

  const { speechStatus, start, pause, stop: stopSpeech } = useSpeech({
    text:       cleanText,
    stableText: true,
    rate:       0.9,    // slightly slower — easier to follow while walking
    pitch:      1.0,
    lang:       'en-GB',
  })

  const isPlaying = speechStatus === 'started'
  const isPaused  = speechStatus === 'paused'

  // Stop speech when dialog closes
  useEffect(() => {
    return () => { stopSpeech() }
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        stopSpeech()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, stopSpeech])

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      stopSpeech()
      onClose()
    }
  }

  return (
    <div className="stop-dialog__backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="stop-dialog" ref={dialogRef}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="stop-dialog__header">
          <div className="stop-dialog__num">{index}</div>
          <div className="stop-dialog__title-wrap">
            <h2 className="stop-dialog__title">{stop.name}</h2>
            {stop.duration_minutes && (
              <span className="stop-dialog__duration">~{stop.duration_minutes} min</span>
            )}
          </div>
          <button
            className="stop-dialog__close"
            onClick={() => { stopSpeech(); onClose() }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Audio controls ─────────────────────────────────────────── */}
        <div className="stop-dialog__audio">
          <span className="stop-dialog__audio-label">
            {isPlaying ? 'Playing…' : isPaused ? 'Paused' : 'Audio guide'}
          </span>
          <div className="stop-dialog__audio-controls">
            {!isPlaying ? (
              <button
                className="stop-dialog__audio-btn stop-dialog__audio-btn--play"
                onClick={start}
                aria-label={isPaused ? 'Resume' : 'Play audio guide'}
              >
                {isPaused ? '▶ Resume' : '▶ Play'}
              </button>
            ) : (
              <button
                className="stop-dialog__audio-btn stop-dialog__audio-btn--pause"
                onClick={pause}
                aria-label="Pause"
              >
                ⏸ Pause
              </button>
            )}
            {(isPlaying || isPaused) && (
              <button
                className="stop-dialog__audio-btn stop-dialog__audio-btn--stop"
                onClick={stopSpeech}
                aria-label="Stop"
              >
                ■ Stop
              </button>
            )}
          </div>
        </div>

        {/* ── Stop photo ─────────────────────────────────────────────── */}
        {stop.image_url && (
          <div className="stop-dialog__img">
            <img src={stop.image_url} alt={stop.name} loading="lazy" />
          </div>
        )}

        {/* ── Description ────────────────────────────────────────────── */}
        {stop.description && (
          <div className="stop-dialog__desc markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {stop.description}
            </ReactMarkdown>
          </div>
        )}

        {/* ── Local tip ──────────────────────────────────────────────── */}
        {stop.local_tip && (
          <div className="stop-dialog__tip">
            <span className="stop-dialog__tip-label">Local tip</span>
            <span className="stop-dialog__tip-text">{stop.local_tip}</span>
          </div>
        )}

      </div>
    </div>
  )
}