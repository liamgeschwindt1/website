'use client'

import { Campaign, Persona } from '@/context/CampaignContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  campaigns: Campaign[]
  personas: Persona[]
}

const STATUS_COLORS: Record<string, string> = {
  Active: '#01B4AF',
  Scheduled: '#FFB100',
  Draft: 'rgba(247,247,247,0.25)',
  Completed: 'rgba(147,51,234,0.7)',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function monthLabel(year: number, month: number) {
  return `${MONTHS[month]} ${year}`
}

export default function CampaignTimeline({ campaigns, personas }: Props) {
  const router = useRouter()
  const [windowStart, setWindowStart] = useState(() => {
    const d = new Date('2026-04-01')
    return d
  })
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Window = 9 months
  const windowMonths = 9
  const windowEnd = new Date(windowStart)
  windowEnd.setMonth(windowEnd.getMonth() + windowMonths)
  const windowDuration = windowEnd.getTime() - windowStart.getTime()

  function prevMonth() {
    const d = new Date(windowStart)
    d.setMonth(d.getMonth() - 1)
    setWindowStart(d)
  }
  function nextMonth() {
    const d = new Date(windowStart)
    d.setMonth(d.getMonth() + 1)
    setWindowStart(d)
  }

  // Generate month labels
  const monthLabels: { label: string; left: number }[] = []
  const cur = new Date(windowStart)
  while (cur < windowEnd) {
    const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1)
    const left = Math.max(0, ((monthStart.getTime() - windowStart.getTime()) / windowDuration) * 100)
    monthLabels.push({ label: monthLabel(cur.getFullYear(), cur.getMonth()), left })
    cur.setMonth(cur.getMonth() + 1)
  }

  // Today line
  const todayLeft = ((Date.now() - windowStart.getTime()) / windowDuration) * 100

  const hoveredCampaign = campaigns.find(c => c.id === hoveredId)
  const hoveredPersona = hoveredCampaign ? personas.find(p => p.id === hoveredCampaign.persona) : null

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>Timeline</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth}
            className="px-3 py-1.5 rounded-[6px] text-[13px] border"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>←</button>
          <span className="text-[13px] min-w-[120px] text-center" style={{ color: 'var(--text)' }}>
            {monthLabel(windowStart.getFullYear(), windowStart.getMonth())}
          </span>
          <button type="button" onClick={nextMonth}
            className="px-3 py-1.5 rounded-[6px] text-[13px] border"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>→</button>
        </div>
      </div>

      <div className="relative rounded-[12px] border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
        {/* Month headers */}
        <div className="relative h-8 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="absolute inset-0 ml-[140px]">
            {monthLabels.map(({ label, left }) => (
              <span key={label} className="absolute text-[10px] top-2"
                style={{ left: `${left}%`, color: 'var(--muted)', transform: 'translateX(-50%)' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="relative" style={{ minHeight: campaigns.length * 48 }}>
          {campaigns.map((campaign, i) => {
            const start = new Date(campaign.startDate).getTime()
            const end = new Date(campaign.endDate).getTime()
            let left = ((start - windowStart.getTime()) / windowDuration) * 100
            let width = ((end - start) / windowDuration) * 100

            // Clamp
            if (left + width < 0 || left > 100) { left = 0; width = 0 }
            if (left < 0) { width += left; left = 0 }
            if (left + width > 100) width = 100 - left

            const yTop = i * 48 + 12

            return (
              <div key={campaign.id} className="absolute left-0 right-0" style={{ top: yTop, height: 32 }}>
                {/* Row label */}
                <div className="absolute left-0 flex items-center h-full" style={{ width: 140 }}>
                  <span className="text-[12px] truncate pl-4 pr-2 w-full" style={{ color: 'var(--body)' }}>{campaign.name}</span>
                </div>
                {/* Bar area */}
                <div className="absolute h-full" style={{ left: 140, right: 0 }}>
                  {width > 0 && (
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                      onMouseEnter={e => { setHoveredId(campaign.id); setTooltipPos({ x: e.clientX, y: e.clientY }) }}
                      onMouseMove={e => setTooltipPos({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredId(null)}
                      className="absolute h-6 rounded-[4px] top-[4px] transition-opacity hover:opacity-80"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: STATUS_COLORS[campaign.status] ?? 'rgba(247,247,247,0.25)',
                      }}
                    />
                  )}
                </div>
              </div>
            )
          })}

          {/* Today line */}
          {todayLeft >= 0 && todayLeft <= 100 && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{ left: `calc(140px + ${todayLeft}% * (100% - 140px) / 100%)`, width: 1, borderLeft: '1.5px dashed #DC2626', zIndex: 10 }}
            />
          )}
        </div>

        {/* Empty state */}
        {campaigns.length === 0 && (
          <div className="py-16 text-center" style={{ color: 'var(--muted)' }}>No campaigns to display.</div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4">
        {[
          { label: 'Active', color: '#01B4AF' },
          { label: 'Scheduled', color: '#FFB100' },
          { label: 'Draft', color: 'rgba(247,247,247,0.4)' },
          { label: 'Completed', color: 'rgba(147,51,234,0.7)' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[12px]" style={{ color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredCampaign && (
        <div
          className="fixed z-50 pointer-events-none rounded-[8px] border p-3 text-[12px]"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 8,
            background: '#031119',
            borderColor: 'rgba(255,255,255,0.12)',
            color: 'var(--text)',
            maxWidth: 220,
          }}
        >
          <p className="font-semibold mb-1">{hoveredCampaign.name}</p>
          <p style={{ color: 'var(--muted)' }}>{hoveredCampaign.startDate} → {hoveredCampaign.endDate}</p>
          <p style={{ color: 'var(--muted)' }}>Goal: {hoveredCampaign.goal}</p>
          {hoveredPersona && <p style={{ color: 'var(--teal)' }}>Persona: {hoveredPersona.name}</p>}
        </div>
      )}
    </div>
  )
}
