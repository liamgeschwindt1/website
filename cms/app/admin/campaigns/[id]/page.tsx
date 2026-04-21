'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaigns } from '@/context/CampaignContext'
import { useToast } from '@/components/Toast'
import PersonaCard from '@/components/campaigns/PersonaCard'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Active: { bg: 'rgba(1,180,175,0.15)', text: '#01B4AF' },
  Scheduled: { bg: 'rgba(255,177,0,0.15)', text: '#FFB100' },
  Draft: { bg: 'rgba(255,255,255,0.08)', text: 'rgba(247,247,247,0.6)' },
  Completed: { bg: 'rgba(147,51,234,0.15)', text: '#a855f7' },
}

function progressPercent(start: string, end: string): number {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now <= s) return 0
  if (now >= e) return 100
  return Math.round(((now - s) / (e - s)) * 100)
}

function InlineEdit({ value, onSave, multiline = false, className = '', style = {} }: {
  value: string
  onSave: (v: string) => void
  multiline?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function save() {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  if (editing) {
    return multiline ? (
      <textarea
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        rows={3}
        className={`w-full px-3 py-2 rounded-[6px] border text-[13px] resize-none focus:outline-none focus:border-[var(--teal)] ${className}`}
        style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)', ...style }}
      />
    ) : (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={e => e.key === 'Enter' && save()}
        className={`w-full px-3 py-2 rounded-[6px] border focus:outline-none focus:border-[var(--teal)] ${className}`}
        style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)', ...style }}
      />
    )
  }

  return (
    <button type="button" className={`text-left w-full ${className}`} style={style} onClick={() => { setDraft(value); setEditing(true) }}>
      {value || <span style={{ color: 'var(--muted)' }}>Click to edit…</span>}
    </button>
  )
}

function MetricField({ label, value, onSave }: { label: string; value: number | null; onSave: (v: number | null) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value?.toString() ?? '')

  function save() {
    setEditing(false)
    const n = draft === '' ? null : Number(draft)
    onSave(isNaN(n as number) ? null : n)
  }

  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--muted)' }}>{label}</span>
      {editing ? (
        <input
          autoFocus
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={e => e.key === 'Enter' && save()}
          className="w-full px-2 py-1 rounded-[5px] border text-[14px] focus:outline-none focus:border-[var(--teal)]"
          style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}
        />
      ) : (
        <button type="button" onClick={() => { setDraft(value?.toString() ?? ''); setEditing(true) }}
          className="text-left text-[20px] font-semibold" style={{ color: value !== null ? 'var(--text)' : 'var(--muted)' }}>
          {value !== null ? value.toLocaleString() : '—'}
        </button>
      )}
    </div>
  )
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { campaigns, personas, updateCampaign } = useCampaigns()
  const { showToast } = useToast()

  const campaign = campaigns.find(c => c.id === id)
  if (!campaign) {
    return (
      <div className="px-8 py-12 text-center" style={{ color: 'var(--muted)' }}>
        Campaign not found.{' '}
        <button type="button" onClick={() => router.push('/admin/campaigns')} className="underline" style={{ color: 'var(--teal)' }}>
          Back to campaigns
        </button>
      </div>
    )
  }

  const persona = personas.find(p => p.id === campaign.persona)
  const pct = progressPercent(campaign.startDate, campaign.endDate)
  const statusStyle = STATUS_COLORS[campaign.status] ?? STATUS_COLORS['Draft']

  const todayLeft = (() => {
    const s = new Date(campaign.startDate).getTime()
    const e = new Date(campaign.endDate).getTime()
    const now = Date.now()
    const left = ((now - s) / (e - s)) * 100
    return Math.max(0, Math.min(100, left))
  })()

  function update(changes: Parameters<typeof updateCampaign>[1]) {
    if (!campaign) return
    updateCampaign(campaign.id, changes)
    showToast('Saved')
  }

  return (
    <div className="px-8 py-8 max-w-[1100px]">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push('/admin/campaigns')}
        className="flex items-center gap-1.5 text-[13px] mb-6 hover:opacity-80"
        style={{ color: 'var(--muted)' }}
      >
        ← All campaigns
      </button>

      <div className="flex gap-8">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <InlineEdit
            value={campaign.name}
            onSave={name => update({ name })}
            className="text-[26px] font-semibold mb-3"
            style={{ color: 'var(--text)', fontSize: 26, lineHeight: '1.2' }}
          />

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: statusStyle.bg, color: statusStyle.text }}>
              {campaign.status}
            </span>
            {campaign.type.map(t => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-[4px]"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}>
                {t}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--muted)' }}>Description</p>
            <InlineEdit
              value={campaign.description}
              onSave={description => update({ description })}
              multiline
              className="text-[14px] leading-relaxed"
              style={{ color: 'var(--body)' }}
            />
          </div>

          {/* Timeline bar */}
          <div className="mb-6 p-4 rounded-[10px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
            <p className="text-[11px] uppercase tracking-wide font-semibold mb-3" style={{ color: 'var(--muted)' }}>Timeline</p>
            <div className="flex items-center justify-between text-[11px] mb-2" style={{ color: 'var(--muted)' }}>
              <span>{campaign.startDate}</span>
              <span className="font-medium" style={{ color: '#FFB100' }}>{pct}% complete</span>
              <span>{campaign.endDate}</span>
            </div>
            <div className="relative rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#FFB100' }} />
              {/* Today marker */}
              <div className="absolute top-0 bottom-0 w-0.5 -ml-px" style={{ left: `${todayLeft}%`, background: '#DC2626' }} />
            </div>
          </div>

          {/* Channels */}
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--muted)' }}>Channels</p>
            <div className="flex flex-wrap gap-2">
              {campaign.type.map(t => (
                <span key={t} className="text-[12px] px-3 py-1 rounded-full border"
                  style={{ borderColor: 'rgba(1,180,175,0.3)', color: 'var(--teal)', background: 'rgba(1,180,175,0.08)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--muted)' }}>Goal</p>
            <InlineEdit
              value={campaign.goal}
              onSave={goal => update({ goal })}
              className="text-[15px] font-medium"
              style={{ color: 'var(--text)' }}
            />
            <div className="mt-3 rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#FFB100' }} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-[320px] flex-shrink-0 flex flex-col gap-5">
          {/* Persona */}
          {persona && (
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--muted)' }}>Persona</p>
              <PersonaCard persona={persona} campaignCount={0} mini />
            </div>
          )}

          {/* Quick metrics */}
          <div className="p-4 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
            <p className="text-[11px] uppercase tracking-wide font-semibold mb-4" style={{ color: 'var(--muted)' }}>Quick metrics</p>
            <div className="grid grid-cols-3 gap-4">
              <MetricField label="Reach" value={campaign.metrics.reach}
                onSave={v => update({ metrics: { ...campaign.metrics, reach: v } })} />
              <MetricField label="Clicks" value={campaign.metrics.clicks}
                onSave={v => update({ metrics: { ...campaign.metrics, clicks: v } })} />
              <MetricField label="Signups" value={campaign.metrics.signups}
                onSave={v => update({ metrics: { ...campaign.metrics, signups: v } })} />
            </div>
          </div>

          {/* Activity log */}
          <div className="p-4 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
            <p className="text-[11px] uppercase tracking-wide font-semibold mb-4" style={{ color: 'var(--muted)' }}>Activity log</p>
            <div className="flex flex-col gap-3">
              {[
                { text: 'Campaign created', date: campaign.createdAt },
                persona ? { text: `Persona assigned: ${persona.name}`, date: campaign.createdAt } : null,
                campaign.status === 'Active' ? { text: 'Status: Active', date: campaign.startDate } : null,
              ].filter(Boolean).map((entry, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--teal)' }} />
                  <div>
                    <p className="text-[12px]" style={{ color: 'var(--body)' }}>{entry!.text}</p>
                    <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{entry!.date?.slice(0, 10)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
