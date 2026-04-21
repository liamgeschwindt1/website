'use client'

import { useMemo, useState } from 'react'
import { contactSegmentLabel, useCRM } from '@/context/CRMContext'
import ToastStack from '@/components/crm/ToastStack'

type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'
type CampaignType = 'email' | 'outreach' | 'event' | 'content'

interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  audience: string
  targetCount: number
  sentCount: number
  openRate: number
  createdAt: string
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'BLV Community Welcome Series',
    type: 'email',
    status: 'active',
    audience: 'BLV Community',
    targetCount: 48,
    sentCount: 31,
    openRate: 72,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c2',
    name: 'Enterprise Decision Maker Re-engagement',
    type: 'outreach',
    status: 'draft',
    audience: 'Enterprise',
    targetCount: 12,
    sentCount: 0,
    openRate: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c3',
    name: 'O&M Instructor Partnership Promo',
    type: 'email',
    status: 'completed',
    audience: 'Instructor',
    targetCount: 24,
    sentCount: 24,
    openRate: 58,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const STATUS_STYLES: Record<CampaignStatus, { label: string; color: string; bg: string; border: string }> = {
  draft:     { label: 'Draft',     color: 'var(--muted)', bg: 'transparent', border: 'var(--border)' },
  active:    { label: 'Active',    color: 'var(--teal)',  bg: 'rgba(1,180,175,0.08)', border: 'rgba(1,180,175,0.35)' },
  paused:    { label: 'Paused',    color: '#FFB100', bg: 'rgba(255,177,0,0.08)', border: 'rgba(255,177,0,0.35)' },
  completed: { label: 'Complete',  color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.35)' },
}

const TYPE_ICON: Record<CampaignType, string> = {
  email: '✉',
  outreach: '📣',
  event: '📅',
  content: '▤',
}

export default function CampaignsPage() {
  const { contacts, addToast } = useCRM()
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS)
  const [filter, setFilter] = useState<'all' | CampaignStatus>('all')
  const [draft, setDraft] = useState({ name: '', type: 'email' as CampaignType, audience: 'BLV Community', targetCount: '10' })

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter)
  const audiences = useMemo(() => Array.from(new Set(contacts.map((contact) => contactSegmentLabel(contact)))), [contacts])

  const stats = [
    { label: 'Total campaigns', value: campaigns.length },
    { label: 'Active now', value: campaigns.filter((c) => c.status === 'active').length },
    { label: 'CRM contacts', value: contacts.length },
    { label: 'Avg. open rate', value: `${Math.round(campaigns.filter(c => c.sentCount > 0).reduce((a, c) => a + c.openRate, 0) / Math.max(campaigns.filter(c => c.sentCount > 0).length, 1))}%` },
  ]

  return (
    <div className="px-8 py-8" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text)' }}>Campaigns</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>Manage outreach campaigns across your CRM segments.</p>
        </div>
        <div className="grid grid-cols-4 gap-2 rounded-[10px] border p-3" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
          <input value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Campaign name" className="px-3 py-2 rounded-[7px] text-[13px] border col-span-2" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          <select value={draft.type} onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value as CampaignType }))} className="px-3 py-2 rounded-[7px] text-[13px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            {(['email', 'outreach', 'event', 'content'] as CampaignType[]).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <input value={draft.targetCount} onChange={(e) => setDraft((prev) => ({ ...prev, targetCount: e.target.value }))} placeholder="Target" className="px-3 py-2 rounded-[7px] text-[13px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          <select value={draft.audience} onChange={(e) => setDraft((prev) => ({ ...prev, audience: e.target.value }))} className="px-3 py-2 rounded-[7px] text-[13px] border col-span-2" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            {audiences.map((audience) => <option key={audience} value={audience}>{audience}</option>)}
          </select>
          <button
            type="button"
            onClick={() => {
              if (!draft.name.trim()) return
              const targetCount = Number.parseInt(draft.targetCount, 10) || contacts.filter((contact) => contactSegmentLabel(contact) === draft.audience).length
              setCampaigns((prev) => [
                {
                  id: `c-${Date.now()}`,
                  name: draft.name.trim(),
                  type: draft.type,
                  status: 'draft',
                  audience: draft.audience,
                  targetCount,
                  sentCount: 0,
                  openRate: 0,
                  createdAt: new Date().toISOString(),
                },
                ...prev,
              ])
              addToast(`Campaign "${draft.name.trim()}" created.`, 'success')
              setDraft({ name: '', type: 'email', audience: draft.audience, targetCount: '10' })
            }}
            className="px-4 py-2 rounded-[7px] text-[13px] font-medium col-span-2"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            + New Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase mb-2" style={{ color: 'var(--muted)' }}>{s.label}</div>
            <div className="text-[28px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5">
        {(['all', 'active', 'draft', 'paused', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium border capitalize transition-all"
            style={{
              borderColor: filter === f ? 'var(--teal)' : 'var(--border)',
              color: filter === f ? 'var(--teal)' : 'var(--muted)',
              background: filter === f ? 'rgba(1,180,175,0.1)' : 'transparent',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Campaign table */}
      <div className="rounded-[10px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(27,53,79,0.35)' }}>
              {['Campaign', 'Type', 'Audience', 'Status', 'Progress', 'Open rate', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-[11px] font-medium tracking-[0.06em] uppercase" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[14px]" style={{ color: 'var(--muted)' }}>No campaigns found.</td>
              </tr>
            ) : (
              filtered.map((campaign, i) => {
                const st = STATUS_STYLES[campaign.status]
                const progress = campaign.targetCount > 0 ? Math.round((campaign.sentCount / campaign.targetCount) * 100) : 0
                return (
                  <tr key={campaign.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <td className="px-5 py-3">
                      <div className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>{campaign.name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                        Created {new Date(campaign.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px]" style={{ color: 'var(--muted)' }}>
                      <span className="mr-1">{TYPE_ICON[campaign.type]}</span>
                      {campaign.type}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(1,180,175,0.1)', border: '1px solid rgba(1,180,175,0.25)', color: 'var(--teal)' }}>
                        {campaign.audience}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border" style={{ color: st.color, background: st.bg, borderColor: st.border }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ minWidth: 120 }}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--teal)' }} />
                        </div>
                        <span className="text-[11px] w-8 text-right flex-shrink-0" style={{ color: 'var(--muted)' }}>
                          {campaign.sentCount}/{campaign.targetCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[14px] font-semibold" style={{ color: campaign.openRate > 0 ? 'var(--text)' : 'var(--muted)' }}>
                      {campaign.openRate > 0 ? `${campaign.openRate}%` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => {
                          setCampaigns((prev) =>
                            prev.map((existing) =>
                              existing.id === campaign.id
                                ? {
                                    ...existing,
                                    status:
                                      existing.status === 'draft'
                                        ? 'active'
                                        : existing.status === 'active'
                                        ? 'paused'
                                        : existing.status === 'paused'
                                        ? 'completed'
                                        : 'draft',
                                  }
                                : existing
                            )
                          )
                        }}
                        className="text-[12px]"
                        style={{ color: 'var(--teal)' }}
                      >
                        Cycle status
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <ToastStack />
    </div>
  )
}
