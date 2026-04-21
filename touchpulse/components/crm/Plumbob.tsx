'use client'

import React from 'react'
import { healthColor, healthState } from '@/context/CRMContext'

interface PlumbobProps {
  score: number
  size?: number
}

export default function Plumbob({ score, size = 32 }: PlumbobProps) {
  const color = healthColor(score)
  const state = healthState(score)
  const half = size / 2
  const q = size * 0.28

  const animClass =
    state === 'thriving'
      ? 'animate-plumbob-bob'
      : state === 'critical'
      ? 'animate-plumbob-pulse'
      : ''

  return (
    <>
      <style>{`
        @keyframes plumbob-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes plumbob-pulse {
          0%, 100% { filter: drop-shadow(0 0 6px ${color}) drop-shadow(0 0 2px ${color}); }
          50% { filter: drop-shadow(0 0 14px ${color}) drop-shadow(0 0 6px ${color}); }
        }
        .animate-plumbob-bob { animation: plumbob-bob 2s ease-in-out infinite; }
        .animate-plumbob-pulse { animation: plumbob-pulse 1.2s ease-in-out infinite; }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={animClass}
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
        aria-label={`Health: ${score}%`}
      >
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${score}-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`gem-grad-${score}-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="50%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Top diamond */}
        <polygon
          points={`${half},2 ${half - q},${half} ${half},${half - q / 2} ${half + q},${half}`}
          fill={`url(#gem-grad-${score}-${size})`}
          filter={`url(#glow-${score}-${size})`}
          opacity={0.9}
        />
        {/* Bottom diamond */}
        <polygon
          points={`${half - q},${half} ${half},${half + q / 2} ${half + q},${half} ${half},${size - 2}`}
          fill={color}
          filter={`url(#glow-${score}-${size})`}
          opacity={0.75}
        />
        {/* Centre highlight */}
        <ellipse
          cx={half}
          cy={half}
          rx={q * 0.35}
          ry={q * 0.2}
          fill="white"
          opacity={0.45}
          transform={`rotate(-30 ${half} ${half})`}
        />
      </svg>
    </>
  )
}
