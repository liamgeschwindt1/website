'use client'

import { Persona } from '@/context/CampaignContext'
import { useState } from 'react'

interface Props {
  persona: Persona
  campaignCount: number
  mini?: boolean
}

export default function PersonaCard({ persona, campaignCount, mini = false }: Props) {
  const [expanded, setExpanded] = useState(false)
  const initials = persona.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  if (mini) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-[10px] border"
        style={{ background: 'rgba(27,53,79,0.3)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[14px] font-semibold"
          style={{ background: persona.avatarColor, color: '#031119' }}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--text)' }}>{persona.name}</p>
          <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>{persona.segment}</p>
          <p className="text-[11px] italic mt-1 line-clamp-2" style={{ color: 'var(--body)', fontFamily: 'Georgia, serif' }}>"{persona.quote}"</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[12px] border" style={{ background: 'rgba(27,53,79,0.25)', borderColor: 'rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-[16px] font-[500]"
            style={{ background: persona.avatarColor, color: '#031119' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>{persona.name}</p>
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-0.5"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}>
              {persona.segment}
            </span>
          </div>
        </div>
        <p className="text-[12px] mb-1" style={{ color: 'var(--muted)' }}>Age: {persona.ageRange}</p>
        <p className="text-[13px] italic" style={{ color: 'var(--body)', fontFamily: 'Georgia, serif' }}>"{persona.quote}"</p>
      </div>

      {/* Expandable */}
      {expanded && (
        <div className="px-5 pb-4 flex flex-col gap-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="pt-3">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--muted)' }}>Key needs</p>
            <p className="text-[13px]" style={{ color: 'var(--body)' }}>{persona.keyNeeds}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--muted)' }}>Frustrations</p>
            <p className="text-[13px]" style={{ color: 'var(--body)' }}>{persona.frustrations}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--muted)' }}>Tech comfort</p>
              <p className="text-[13px]" style={{ color: 'var(--body)' }}>{persona.techComfort}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--muted)' }}>Channels</p>
              <p className="text-[13px]" style={{ color: 'var(--body)' }}>{persona.channels}</p>
            </div>
          </div>
          <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Campaigns: {campaignCount}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="text-[12px] font-medium"
          style={{ color: 'var(--teal)' }}
        >
          {expanded ? 'Collapse ↑' : 'Expand ↓'}
        </button>
        <div className="flex gap-2">
          <button type="button" className="text-[12px] px-2.5 py-1 rounded-[5px] border"
            style={{ borderColor: 'rgba(1,180,175,0.3)', color: 'var(--teal)' }}>
            Edit
          </button>
          <button type="button" className="text-[12px] px-2.5 py-1 rounded-[5px] border"
            style={{ borderColor: 'rgba(1,180,175,0.3)', color: 'var(--teal)' }}>
            Use in campaign
          </button>
        </div>
      </div>
    </div>
  )
}
