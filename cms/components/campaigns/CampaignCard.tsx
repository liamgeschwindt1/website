'use client'

import { Campaign, Persona } from '@/context/CampaignContext'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'

interface Props {
  campaign: Campaign
  personas: Persona[]
  onStatusChange?: (id: string, status: Campaign['status']) => void
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onArchive?: (id: string) => void
}

const TYPE_COLORS: Record<string, string> = {
  Email: 'rgba(1,180,175,0.15)',
  Social: 'rgba(55,138,221,0.15)',
  Partnership: 'rgba(255,177,0,0.15)',
  PR: 'rgba(247,247,247,0.1)',
  Paid: 'rgba(220,38,38,0.15)',
  Event: 'rgba(147,51,234,0.15)',
}
const TYPE_TEXT: Record<string, string> = {
  Email: '#01B4AF',
  Social: '#378ADD',
  Partnership: '#FFB100',
  PR: 'rgba(247,247,247,0.7)',
  Paid: '#DC2626',
  Event: '#a855f7',
}

function progressPercent(start: string, end: string): number {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now <= s) return 0
  if (now >= e) return 100
  return Math.round(((now - s) / (e - s)) * 100)
}

export default function CampaignCard({ campaign, personas, onEdit, onDuplicate, onArchive }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const persona = personas.find(p => p.id === campaign.persona)
  const pct = progressPercent(campaign.startDate, campaign.endDate)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: campaign.id,
    data: { campaign },
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'rotate(1.5deg)' : undefined,
        transition: 'border-color 200ms, opacity 200ms',
        background: 'rgba(27,53,79,0.45)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: 16,
        cursor: 'grab',
      }}
      className="hover:border-[rgba(1,180,175,0.35)] relative"
      {...attributes}
      {...listeners}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <button
          type="button"
          className="text-left flex-1"
          onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
          onPointerDown={e => e.stopPropagation()}
        >
          <p className="text-[14px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>{campaign.name}</p>
        </button>
        {/* Three dot menu */}
        <div ref={menuRef} className="relative flex-shrink-0" onPointerDown={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            className="w-6 h-6 flex items-center justify-center rounded text-[16px]"
            style={{ color: 'var(--muted)' }}
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-50 rounded-[8px] border overflow-hidden py-1 w-[140px]"
              style={{ background: '#031119', borderColor: 'rgba(255,255,255,0.12)' }}>
              {[
                { label: 'Edit', action: () => { onEdit?.(campaign.id); setMenuOpen(false) } },
                { label: 'Duplicate', action: () => { onDuplicate?.(campaign.id); setMenuOpen(false) } },
                { label: 'Archive', action: () => { onArchive?.(campaign.id); setMenuOpen(false) } },
              ].map(item => (
                <button key={item.label} type="button" onClick={item.action}
                  className="w-full text-left px-4 py-2 text-[13px] hover:bg-white/5"
                  style={{ color: item.label === 'Archive' ? '#DC2626' : 'var(--text)' }}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Type badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        {campaign.type.map(t => (
          <span key={t} className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]"
            style={{ background: TYPE_COLORS[t] ?? 'rgba(255,255,255,0.08)', color: TYPE_TEXT[t] ?? 'var(--muted)' }}>
            {t}
          </span>
        ))}
      </div>

      {/* Persona pill */}
      {persona && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(1,180,175,0.12)', color: 'var(--teal)', border: '0.5px solid rgba(1,180,175,0.3)' }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: persona.avatarColor }} />
            {persona.name}
          </span>
        </div>
      )}

      {/* Dates */}
      <p className="text-[11px] mb-1" style={{ color: 'var(--muted)' }}>
        {campaign.startDate} → {campaign.endDate}
      </p>

      {/* Goal */}
      <p className="text-[12px] mb-3" style={{ color: 'var(--body)' }}>{campaign.goal}</p>

      {/* Progress bar */}
      <div className="mb-3 rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#FFB100' }} />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {campaign.tags.map(tag => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-[4px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
