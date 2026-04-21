'use client'

import React, { useState } from 'react'
import { Contact, useCRM, healthColor, healthState, Segment } from '@/context/CRMContext'
import Plumbob from './Plumbob'

const SEGMENTS: Segment[] = ['BLV Community', 'Instructor', 'Enterprise', 'Champion', 'General']

interface ContactTableProps {
  contacts: Contact[]
  onSelect: (contact: Contact) => void
}

export default function ContactTable({ contacts, onSelect }: ContactTableProps) {
  const { updateContact, deleteContacts, addToast } = useCRM()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [quickNoteId, setQuickNoteId] = useState<string | null>(null)
  const [quickNoteDraft, setQuickNoteDraft] = useState('')

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === contacts.length && contacts.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(contacts.map((c) => c.id)))
    }
  }

  function handleDelete() {
    deleteContacts(Array.from(selected))
    addToast(`${selected.size} contact${selected.size !== 1 ? 's' : ''} deleted.`, 'info')
    setSelected(new Set())
  }

  function handleUpdateSegment(segment: Segment) {
    selected.forEach((id) => updateContact(id, { segment }))
    addToast(`Segment updated to "${segment}" for ${selected.size} contact${selected.size !== 1 ? 's' : ''}.`, 'success')
    setSelected(new Set())
  }

  function submitQuickNote(contact: Contact) {
    if (!quickNoteDraft.trim()) return
    updateContact(contact.id, { notes: quickNoteDraft.trim() })
    addToast(`Note saved for ${contact.name}.`)
    setQuickNoteId(null)
    setQuickNoteDraft('')
  }

  const allChecked = selected.size > 0 && selected.size === contacts.length
  const someChecked = selected.size > 0 && selected.size < contacts.length

  return (
    <div className="flex flex-col gap-0 relative">
      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked }}
                  onChange={toggleAll}
                  className="accent-teal cursor-pointer"
                  aria-label="Select all"
                />
              </th>
              <th className="text-left px-3 py-3 font-medium" style={{ color: 'rgba(247,247,247,0.5)' }}>Health</th>
              <th className="text-left px-3 py-3 font-medium" style={{ color: 'rgba(247,247,247,0.5)' }}>Name</th>
              <th className="text-left px-3 py-3 font-medium hidden md:table-cell" style={{ color: 'rgba(247,247,247,0.5)' }}>Email</th>
              <th className="text-left px-3 py-3 font-medium hidden lg:table-cell" style={{ color: 'rgba(247,247,247,0.5)' }}>Segment</th>
              <th className="text-left px-3 py-3 font-medium hidden lg:table-cell" style={{ color: 'rgba(247,247,247,0.5)' }}>Persona</th>
              <th className="w-20 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: 'rgba(247,247,247,0.35)' }}>
                  No contacts found. Import some or add one manually.
                </td>
              </tr>
            ) : (
              contacts.map((contact, i) => {
                const hColor = healthColor(contact.health)
                const isSelected = selected.has(contact.id)
                const isHovered = hoverId === contact.id

                return (
                  <React.Fragment key={contact.id}>
                    <tr
                      onMouseEnter={() => setHoverId(contact.id)}
                      onMouseLeave={() => setHoverId(null)}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                        background: isSelected
                          ? 'rgba(1,180,175,0.07)'
                          : isHovered
                          ? 'rgba(255,255,255,0.03)'
                          : 'transparent',
                      }}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(contact.id)}
                          className="accent-teal cursor-pointer"
                          aria-label={`Select ${contact.name}`}
                        />
                      </td>

                      {/* Health */}
                      <td className="px-3 py-2.5" onClick={() => onSelect(contact)}>
                        <div className="flex items-center gap-2">
                          <Plumbob score={contact.health} size={24} />
                          <span className="text-xs font-mono" style={{ color: hColor }}>{contact.health}%</span>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-3 py-2.5 font-medium" style={{ color: '#F7F7F7' }} onClick={() => onSelect(contact)}>
                        {contact.name}
                      </td>

                      {/* Email */}
                      <td className="px-3 py-2.5 hidden md:table-cell" style={{ color: 'rgba(247,247,247,0.65)' }} onClick={() => onSelect(contact)}>
                        {contact.email}
                      </td>

                      {/* Segment */}
                      <td className="px-3 py-2.5 hidden lg:table-cell" onClick={() => onSelect(contact)}>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: 'rgba(1,180,175,0.1)',
                            border: '1px solid rgba(1,180,175,0.25)',
                            color: '#01B4AF',
                          }}
                        >
                          {contact.segment}
                        </span>
                      </td>

                      {/* Persona */}
                      <td className="px-3 py-2.5 hidden lg:table-cell" style={{ color: 'rgba(247,247,247,0.55)' }} onClick={() => onSelect(contact)}>
                        {contact.persona || '—'}
                      </td>

                      {/* Action icons (on hover) */}
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div
                          className="flex items-center gap-1.5 transition-opacity"
                          style={{ opacity: isHovered || quickNoteId === contact.id ? 1 : 0 }}
                        >
                          {/* Quick Note */}
                          <button
                            onClick={() => {
                              setQuickNoteId(quickNoteId === contact.id ? null : contact.id)
                              setQuickNoteDraft(contact.notes || '')
                            }}
                            title="Quick Note"
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 text-base"
                            aria-label="Quick Note"
                          >
                            📝
                          </button>
                          {/* Add to Campaign (placeholder) */}
                          <button
                            onClick={() => addToast(`${contact.name} added to campaign.`, 'info')}
                            title="Add to Campaign"
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 text-base"
                            aria-label="Add to Campaign"
                          >
                            📣
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline Quick Note */}
                    {quickNoteId === contact.id && (
                      <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
                        <td colSpan={7} className="px-4 py-3">
                          <div className="flex gap-2 items-start">
                            <textarea
                              className="flex-1 rounded-lg px-3 py-2 text-sm resize-none outline-none"
                              rows={2}
                              placeholder="Quick note…"
                              value={quickNoteDraft}
                              onChange={(e) => setQuickNoteDraft(e.target.value)}
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#F7F7F7',
                              }}
                              autoFocus
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => submitQuickNote(contact)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{ background: '#01B4AF', color: '#031119' }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setQuickNoteId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs"
                                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(247,247,247,0.65)' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(27,53,79,0.97)',
            border: '1px solid rgba(1,180,175,0.3)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <span className="text-sm font-medium" style={{ color: 'rgba(247,247,247,0.75)' }}>
            {selected.size} selected
          </span>
          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <button
            onClick={() => addToast(`${selected.size} contact${selected.size !== 1 ? 's' : ''} added to campaign.`, 'info')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-90"
            style={{ background: 'rgba(1,180,175,0.15)', border: '1px solid rgba(1,180,175,0.3)', color: '#01B4AF' }}
          >
            + Add to Campaign
          </button>
          <div className="relative group">
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-90"
              style={{ background: 'rgba(255,177,0,0.12)', border: '1px solid rgba(255,177,0,0.3)', color: '#FFB100' }}
            >
              Update Segment ▾
            </button>
            <div
              className="absolute bottom-full mb-2 left-0 hidden group-hover:block rounded-xl overflow-hidden shadow-2xl z-40"
              style={{ background: '#0a1f2e', border: '1px solid rgba(255,255,255,0.1)', minWidth: '160px' }}
            >
              {SEGMENTS.map((seg) => (
                <button
                  key={seg}
                  onClick={() => handleUpdateSegment(seg)}
                  className="block w-full text-left px-4 py-2 text-xs hover:bg-white/10 transition-colors"
                  style={{ color: 'rgba(247,247,247,0.8)' }}
                >
                  {seg}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-90"
            style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#DC2626' }}
          >
            Delete
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-xs"
            style={{ color: 'rgba(247,247,247,0.4)' }}
            aria-label="Clear selection"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
