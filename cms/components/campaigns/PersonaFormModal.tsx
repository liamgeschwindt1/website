'use client'

import { useState } from 'react'
import { Persona } from '@/context/CampaignContext'

interface Props {
  onSubmit: (p: Persona) => void
  onClose: () => void
}

export default function PersonaFormModal({ onSubmit, onClose }: Props) {
  const [name, setName] = useState('')
  const [segment, setSegment] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [keyNeeds, setKeyNeeds] = useState('')
  const [frustrations, setFrustrations] = useState('')
  const [techComfort, setTechComfort] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [channels, setChannels] = useState('')
  const [quote, setQuote] = useState('')
  const [avatarColor, setAvatarColor] = useState('#01B4AF')

  function handleSubmit() {
    const id = `p_${Date.now()}`
    onSubmit({ id, name, segment, ageRange, keyNeeds, frustrations, techComfort, channels, quote, avatarColor, campaigns: 0 })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-[520px] mx-4 rounded-[16px] border" style={{ background: '#031119', borderColor: 'rgba(255,255,255,0.12)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text)' }}>New Persona</h2>
          <button type="button" onClick={onClose} className="text-[20px]" style={{ color: 'var(--muted)' }}>×</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {[
            { label: 'Name', value: name, setter: setName, placeholder: 'e.g. Alex' },
            { label: 'Segment', value: segment, setter: setSegment, placeholder: 'e.g. BLV Community — End User' },
            { label: 'Age range', value: ageRange, setter: setAgeRange, placeholder: 'e.g. 25–55' },
            { label: 'Quote', value: quote, setter: setQuote, placeholder: 'A representative quote…' },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>{label}</label>
              <input type="text" value={value} onChange={e => setter(e.target.value)} placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
                style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }} />
            </div>
          ))}
          {[
            { label: 'Key needs', value: keyNeeds, setter: setKeyNeeds },
            { label: 'Frustrations', value: frustrations, setter: setFrustrations },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>{label}</label>
              <textarea value={value} onChange={e => setter(e.target.value)} rows={2}
                className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)] resize-none"
                style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }} />
            </div>
          ))}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Tech comfort</label>
            <select value={techComfort} onChange={e => setTechComfort(e.target.value as 'Low' | 'Medium' | 'High')}
              className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
              style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Preferred channels (comma separated)</label>
            <input type="text" value={channels} onChange={e => setChannels(e.target.value)} placeholder="e.g. Email, LinkedIn"
              className="w-full px-3.5 py-2.5 rounded-[6px] border text-[13px] focus:outline-none focus:border-[var(--teal)]"
              style={{ background: 'rgba(27,53,79,0.30)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text)' }} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Avatar colour</label>
            <div className="flex items-center gap-3">
              <input type="color" value={avatarColor} onChange={e => setAvatarColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0" />
              <span className="text-[12px] font-mono" style={{ color: 'var(--muted)' }}>{avatarColor}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-[6px] text-[13px] font-medium border"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--muted)', background: 'transparent' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit}
            className="px-5 py-2 rounded-[6px] text-[13px] font-semibold hover:opacity-90"
            style={{ background: '#FFB100', color: '#031119' }}>
            Save persona
          </button>
        </div>
      </div>
    </div>
  )
}
