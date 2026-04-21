'use client'

import React, { useState, useRef } from 'react'
import { Contact, useCRM, healthColor, healthState } from '@/context/CRMContext'
import Plumbob from './Plumbob'

interface ProfileDrawerProps {
  contact: Contact | null
  onClose: () => void
}

const TOUCHPOINT_TYPES = ['Call', 'Email', 'Note'] as const

function NeedsBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 70 ? '#22c55e' : value >= 40 ? '#FFB100' : '#DC2626'
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(247,247,247,0.65)' }}>
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

function InlineField({
  label,
  value,
  onSave,
}: {
  label: string
  value: string
  onSave: (val: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(value)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function commit() {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  return (
    <div className="mb-4">
      <p className="text-xs mb-1" style={{ color: 'rgba(247,247,247,0.45)' }}>{label}</p>
      {editing ? (
        <input
          ref={inputRef}
          className="w-full rounded-lg px-3 py-1.5 text-sm outline-none"
          style={{
            background: 'rgba(1,180,175,0.1)',
            border: '1px solid rgba(1,180,175,0.4)',
            color: '#F7F7F7',
          }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
        />
      ) : (
        <p
          className="text-sm cursor-pointer rounded px-1 -mx-1 py-0.5 hover:bg-white/5 transition-colors"
          style={{ color: '#F7F7F7' }}
          onClick={startEdit}
          title="Click to edit"
        >
          {value || <span style={{ color: 'rgba(247,247,247,0.3)' }}>—</span>}
        </p>
      )}
    </div>
  )
}

export default function ProfileDrawer({ contact, onClose }: ProfileDrawerProps) {
  const { updateContact, logTouchPoint, addToast } = useCRM()
  const [tpType, setTpType] = useState<typeof TOUCHPOINT_TYPES[number]>('Call')
  const [tpNote, setTpNote] = useState('')

  if (!contact) return null

  const hState = healthState(contact.health)
  const hColor = healthColor(contact.health)

  function handleLogTouchPoint() {
    if (!tpNote.trim()) {
      addToast('Please enter a description for this touch point.', 'error')
      return
    }
    if (!contact) return
    logTouchPoint(contact.id, tpType, tpNote.trim())
    setTpNote('')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(3,17,25,0.55)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: '450px',
          background: 'rgba(3,17,25,0.97)',
          borderLeft: '1px solid rgba(1,180,175,0.2)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex flex-col gap-1 items-center">
            <Plumbob score={contact.health} size={40} />
            <span className="text-xs font-mono" style={{ color: hColor }}>
              {contact.health}%
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate" style={{ color: '#F7F7F7' }}>
              {contact.name}
            </h2>
            <p className="text-sm truncate" style={{ color: 'rgba(247,247,247,0.55)' }}>
              {contact.segment}
              {contact.persona ? ` · ${contact.persona}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'rgba(247,247,247,0.5)' }}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Health Status */}
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: `${hColor}14`,
              border: `1px solid ${hColor}33`,
              color: hColor,
            }}
          >
            {hState === 'thriving' && '🌟 Thriving — keep up the momentum!'}
            {hState === 'neglected' && '⚠️ Neglected — schedule a touch point soon.'}
            {hState === 'warning' && '🔥 Warning — this contact is at risk.'}
            {hState === 'critical' && '🚨 Critical — immediate attention required!'}
          </div>

          {/* Sims Needs Panel */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(247,247,247,0.45)' }}>
              Sims Needs
            </h3>
            <NeedsBar label="Social (Engagement)" value={contact.social} />
            <NeedsBar label="Energy (Activity)" value={contact.energy} />
            <NeedsBar label="Hygiene (Data Quality)" value={contact.hygiene} />
            <NeedsBar label="Fun (Campaign Clicks)" value={contact.fun} />
          </section>

          {/* Contact Fields — inline editable */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(247,247,247,0.45)' }}>
              Contact Info
            </h3>
            <InlineField
              label="Name"
              value={contact.name}
              onSave={(v) => updateContact(contact.id, { name: v })}
            />
            <InlineField
              label="Email"
              value={contact.email}
              onSave={(v) => updateContact(contact.id, { email: v })}
            />
            <InlineField
              label="Phone"
              value={contact.phone || ''}
              onSave={(v) => updateContact(contact.id, { phone: v })}
            />
            <InlineField
              label="Notes"
              value={contact.notes || ''}
              onSave={(v) => updateContact(contact.id, { notes: v })}
            />
          </section>

          {/* Log a Touch Point */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(247,247,247,0.45)' }}>
              Log Touch Point
            </h3>
            <div className="flex gap-2 mb-2">
              {TOUCHPOINT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTpType(t)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: tpType === t ? 'rgba(1,180,175,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${tpType === t ? 'rgba(1,180,175,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: tpType === t ? '#01B4AF' : 'rgba(247,247,247,0.65)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none"
              rows={2}
              placeholder="Describe this interaction…"
              value={tpNote}
              onChange={(e) => setTpNote(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F7F7F7',
              }}
            />
            <button
              onClick={handleLogTouchPoint}
              className="mt-2 w-full py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#FFB100', color: '#031119' }}
            >
              + Log Touch Point
            </button>
          </section>

          {/* Activity Log */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(247,247,247,0.45)' }}>
              Activity Log
            </h3>
            {contact.activityLog.length === 0 ? (
              <p className="text-sm" style={{ color: 'rgba(247,247,247,0.35)' }}>No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {contact.activityLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg px-3 py-2.5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: entry.type === 'Import' ? '#01B4AF' : entry.type === 'Call' ? '#22c55e' : entry.type === 'Email' ? '#FFB100' : 'rgba(247,247,247,0.65)' }}
                      >
                        {entry.type}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(247,247,247,0.35)' }}>
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(247,247,247,0.75)' }}>
                      {entry.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  )
}
