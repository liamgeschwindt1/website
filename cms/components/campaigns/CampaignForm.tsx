'use client'

import { useState } from 'react'
import { Campaign, Persona, CampaignStatus } from '@/context/CampaignContext'

const CAMPAIGN_TYPES = ['Email', 'Social', 'Partnership', 'PR', 'Paid', 'Event']

interface Props {
  personas: Persona[]
  onSubmit: (data: Omit<Campaign, 'id' | 'createdAt' | 'metrics'>) => void
  onClose: () => void
}

export default function CampaignForm({ personas, onSubmit, onClose }: Props) {
  const [name, setName] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const [persona, setPersona] = useState('')
  const [goal, setGoal] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState(false)
  const [shake, setShake] = useState(false)

  function toggleType(t: string) {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function handleSubmit() {
    if (!name.trim()) {
      setNameError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    setNameError(false)
    onSubmit({
      name: name.trim(),
      type: types,
      persona,
      goal,
      startDate,
      endDate,
      description,
      status: 'Draft' as CampaignStatus,
      tags: types,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="w-full max-w-[560px] mx-4 rounded-[16px] border"
        style={{ background: '#031119', borderColor: 'rgba(255,255,255,0.12)' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text)' }}>New Campaign</h2>
          <button type="button" onClick={onClose} className="text-[20px]" style={{ color: 'var(--muted)' }}>×</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Campaign name *</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameError(false) }}
              placeholder="Enter campaign name"
              className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
              style={{
                background: 'rgba(27,53,79,0.30)',
                borderColor: nameError ? '#DC2626' : 'rgba(255,255,255,0.12)',
                color: 'var(--text)',
                animation: shake ? 'shake 0.4s ease' : undefined,
              }}
            />
            {nameError && <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>Campaign name is required</p>}
          </div>

          {/* Type multi-select */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Campaign type</label>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium border transition-all"
                  style={types.includes(t)
                    ? { background: 'rgba(1,180,175,0.15)', borderColor: 'var(--teal)', color: 'var(--teal)' }
                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--muted)' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Target persona */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Target persona</label>
            <select
              value={persona}
              onChange={e => setPersona(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
              style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}
            >
              <option value="">Select persona…</option>
              {personas.map(p => <option key={p.id} value={p.id}>{p.name} — {p.segment}</option>)}
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Goal</label>
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. 500 sign-ups"
              className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
              style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
                style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>End date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
                style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the campaign…"
              className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)] resize-none"
              style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[6px] text-[13px] font-medium border"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--muted)', background: 'transparent' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-[6px] text-[13px] font-semibold hover:opacity-90 transition-opacity"
            style={{ background: '#FFB100', color: '#031119' }}
          >
            Create campaign
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
