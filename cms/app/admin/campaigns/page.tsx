'use client'

import { useState, useEffect } from 'react'
import { useCampaigns, Campaign } from '@/context/CampaignContext'
import { useToast } from '@/components/Toast'
import CampaignBoard from '@/components/campaigns/CampaignBoard'
import CampaignTimeline from '@/components/campaigns/CampaignTimeline'
import PersonaManager from '@/components/campaigns/PersonaManager'
import CampaignForm from '@/components/campaigns/CampaignForm'

type Tab = 'Overview' | 'Timeline' | 'Personas' | 'Settings'

const DEFAULT_TAGS = ['Launch', 'Email', 'Social', 'B2B', 'Partnership', 'Awareness', 'PR', 'Paid', 'Event']

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative w-10 h-5 rounded-full transition-colors"
      style={{ background: value ? 'var(--teal)' : 'rgba(255,255,255,0.12)' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
        style={{ background: '#fff', transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

export default function CampaignPage() {
  const { campaigns, personas, addCampaign, updateCampaignStatus, updateCampaign, addPersona } = useCampaigns()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('Overview')
  const [showForm, setShowForm] = useState(false)

  // Settings state
  const [defaultDuration, setDefaultDuration] = useState(30)
  const [defaultStatus, setDefaultStatus] = useState<'Draft' | 'Scheduled'>('Draft')
  const [showProgress, setShowProgress] = useState(true)
  const [showPersonaPills, setShowPersonaPills] = useState(true)
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tp_campaign_tags')
      if (saved) setTags(JSON.parse(saved))
    } catch { /**/ }
  }, [])

  function saveSettings() {
    localStorage.setItem('tp_campaign_tags', JSON.stringify(tags))
    showToast('Settings saved')
  }

  function addTag() {
    const t = newTag.trim()
    if (!t || tags.includes(t)) return
    setTags(prev => [...prev, t])
    setNewTag('')
  }

  function removeTag(t: string) {
    setTags(prev => prev.filter(x => x !== t))
  }

  const active = campaigns.filter(c => c.status === 'Active').length
  const scheduled = campaigns.filter(c => c.status === 'Scheduled').length
  const completed = campaigns.filter(c => c.status === 'Completed').length

  const campaignCounts = personas.reduce((acc, p) => {
    acc[p.id] = campaigns.filter(c => c.persona === p.id).length
    return acc
  }, {} as Record<string, number>)

  const TABS: Tab[] = ['Overview', 'Timeline', 'Personas', 'Settings']

  return (
    <div className="px-8 py-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Campaigns</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>Plan, track and launch campaigns across all channels.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-[6px] text-[13px] font-semibold hover:opacity-90 transition-opacity"
          style={{ background: '#FFB100', color: '#031119' }}
        >
          + New campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-8" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {TABS.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="pb-3 text-[14px] font-medium transition-colors"
            style={{
              color: tab === t ? 'var(--teal)' : 'rgba(247,247,247,0.45)',
              borderBottom: tab === t ? '2px solid var(--teal)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active campaigns', value: active },
              { label: 'Scheduled', value: scheduled },
              { label: 'Completed', value: completed },
              { label: 'Total reach (est.)', value: '4,200' },
            ].map(card => (
              <div key={card.label} className="p-5 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase mb-2" style={{ color: 'var(--muted)' }}>{card.label}</div>
                <div className="text-[28px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Kanban */}
          <CampaignBoard
            campaigns={campaigns}
            personas={personas}
            updateCampaignStatus={updateCampaignStatus}
            onAdd={() => setShowForm(true)}
            onEdit={() => {}}
            onDuplicate={id => {
              const orig = campaigns.find(c => c.id === id)
              if (!orig) return
              const dup: Campaign = { ...orig, id: `c_${Date.now()}`, name: `${orig.name} (copy)`, createdAt: new Date().toISOString() }
              addCampaign(dup)
              showToast('Campaign duplicated')
            }}
            onArchive={id => {
              updateCampaign(id, { status: 'Completed' })
              showToast('Campaign archived')
            }}
          />
        </>
      )}

      {/* Timeline */}
      {tab === 'Timeline' && (
        <CampaignTimeline campaigns={campaigns} personas={personas} />
      )}

      {/* Personas */}
      {tab === 'Personas' && (
        <PersonaManager
          personas={personas}
          onAdd={addPersona}
          onUpdate={() => {}}
          campaignCounts={campaignCounts}
        />
      )}

      {/* Settings */}
      {tab === 'Settings' && (
        <div className="max-w-[560px] flex flex-col gap-8">
          {/* Section 1 — Default fields */}
          <section>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--text)' }}>Default fields</h2>
            <div className="flex flex-col gap-4 p-5 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
              <div className="flex items-center justify-between">
                <label className="text-[13px]" style={{ color: 'var(--body)' }}>Default campaign duration (days)</label>
                <input
                  type="number"
                  value={defaultDuration}
                  onChange={e => setDefaultDuration(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-[6px] border text-[13px] text-right focus:outline-none focus:border-[var(--teal)]"
                  style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[13px]" style={{ color: 'var(--body)' }}>Default status for new campaigns</label>
                <select
                  value={defaultStatus}
                  onChange={e => setDefaultStatus(e.target.value as 'Draft' | 'Scheduled')}
                  className="px-3 py-1.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
                  style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}
                >
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[13px]" style={{ color: 'var(--body)' }}>Show progress bars</label>
                <Toggle value={showProgress} onChange={setShowProgress} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[13px]" style={{ color: 'var(--body)' }}>Show persona pills on cards</label>
                <Toggle value={showPersonaPills} onChange={setShowPersonaPills} />
              </div>
            </div>
          </section>

          {/* Section 2 — Tags */}
          <section>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--text)' }}>Tags</h2>
            <div className="p-5 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full border"
                    style={{ borderColor: 'var(--border)', color: 'var(--body)', background: 'rgba(255,255,255,0.05)' }}>
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-[14px] leading-none hover:text-white" style={{ color: 'var(--muted)' }}>×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="Add tag…"
                  className="flex-1 px-3 py-1.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
                  style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}
                />
                <button type="button" onClick={addTag}
                  className="px-3 py-1.5 rounded-[6px] text-[12px] border"
                  style={{ borderColor: 'rgba(1,180,175,0.3)', color: 'var(--teal)' }}>
                  Add
                </button>
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={saveSettings}
            className="px-6 py-2.5 rounded-[6px] text-[13px] font-semibold hover:opacity-90 self-start"
            style={{ background: '#FFB100', color: '#031119' }}
          >
            Save settings
          </button>
        </div>
      )}

      {/* New campaign modal */}
      {showForm && (
        <CampaignForm
          personas={personas}
          onClose={() => setShowForm(false)}
          onSubmit={data => {
            const id = `c_${Date.now()}`
            addCampaign({ ...data, id, metrics: { reach: null, clicks: null, signups: null }, createdAt: new Date().toISOString() })
            setShowForm(false)
            showToast('Campaign created')
          }}
        />
      )}
    </div>
  )
}
