'use client'

import { useMemo, useState } from 'react'
import { contactSegmentLabel, useCRM, Contact, healthState } from '@/context/CRMContext'
import ContactTable from '@/components/crm/ContactTable'
import ProfileDrawer from '@/components/crm/ProfileDrawer'
import ImportWizard from '@/components/crm/ImportWizard'
import ToastStack from '@/components/crm/ToastStack'
import Plumbob from '@/components/crm/Plumbob'

type FilterKey = 'all' | 'high-priority' | 'champions' | string
type SortKey = 'recent' | 'name' | 'health-desc' | 'health-asc'

function filterContacts(contacts: Contact[], filter: FilterKey, search: string, sort: SortKey): Contact[] {
  let result = contacts
  if (filter === 'high-priority') result = result.filter((c) => healthState(c.health) === 'critical')
  else if (filter === 'champions') result = result.filter((c) => healthState(c.health) === 'thriving')
  else if (filter !== 'all') result = result.filter((c) => contactSegmentLabel(c) === filter)
  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        contactSegmentLabel(c).toLowerCase().includes(q) ||
        (c.persona?.toLowerCase().includes(q) ?? false)
    )
  }

  return [...result].sort((left, right) => {
    if (sort === 'name') return left.name.localeCompare(right.name)
    if (sort === 'health-desc') return right.health - left.health
    if (sort === 'health-asc') return left.health - right.health
    return new Date(right.lastContactedDate).getTime() - new Date(left.lastContactedDate).getTime()
  })
}

export default function CRMPage() {
  const { contacts, createContact, getSegments, renameSegment, addToast } = useCRM()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [segmentDraft, setSegmentDraft] = useState('')
  const [segmentRenameDraft, setSegmentRenameDraft] = useState('')
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', segment: 'General', customSegment: '', persona: '' })

  const segmentLabels = useMemo(() => getSegments(), [getSegments])
  const sidebarFilters = useMemo(
    () => [
      { key: 'all', label: 'All Contacts' },
      { key: 'high-priority', label: 'High Priority' },
      { key: 'champions', label: 'Champions' },
      ...segmentLabels.map((segment) => ({ key: segment, label: segment })),
    ],
    [segmentLabels]
  )
  const filtered = useMemo(() => filterContacts(contacts, activeFilter, search, sort), [contacts, activeFilter, search, sort])
  const criticalCount = contacts.filter((c) => healthState(c.health) === 'critical').length
  const thrivingCount = contacts.filter((c) => healthState(c.health) === 'thriving').length

  function addSegment() {
    const trimmed = segmentDraft.trim()
    if (!trimmed) return
    if (segmentLabels.includes(trimmed)) {
      addToast(`Segment "${trimmed}" already exists.`, 'info')
      return
    }
    const created = createContact({
      name: `${trimmed} Placeholder`,
      email: `${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}@placeholder.local`,
      phone: '',
      segment: 'General',
      customSegment: trimmed,
      campaignIds: [],
      persona: '',
      notes: 'Temporary segment placeholder. Delete or rename after assigning real contacts.',
    })
    if (created) {
      addToast(`Segment "${trimmed}" created.`, 'success')
      setSegmentDraft('')
    }
  }

  function renameActiveSegment() {
    if (activeFilter === 'all' || activeFilter === 'high-priority' || activeFilter === 'champions') return
    const renamed = renameSegment(activeFilter, segmentRenameDraft)
    if (renamed) {
      addToast(`Segment renamed to "${segmentRenameDraft.trim()}".`, 'success')
      setActiveFilter(segmentRenameDraft.trim())
      setSegmentRenameDraft('')
    }
  }

  function handleCreateContact() {
    const segmentName = newContact.customSegment.trim() || newContact.segment
    const isDefaultSegment = ['BLV Community', 'Instructor', 'Enterprise', 'Champion', 'General'].includes(segmentName)
    const created = createContact({
      name: newContact.name.trim(),
      email: newContact.email.trim(),
      phone: newContact.phone.trim(),
      segment: (isDefaultSegment ? segmentName : 'General') as Contact['segment'],
      customSegment: isDefaultSegment ? undefined : segmentName,
      campaignIds: [],
      persona: newContact.persona.trim(),
      notes: '',
    })

    if (!created) {
      addToast('A contact with that email already exists.', 'error')
      return
    }

    addToast('Contact created.', 'success')
    setShowAddContact(false)
    setNewContact({ name: '', email: '', phone: '', segment: 'General', customSegment: '', persona: '' })
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Segment sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 overflow-y-auto" style={{ width: 200, borderRight: '1px solid var(--border)', background: 'rgba(27,53,79,0.1)' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--muted)' }}>Segments</p>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {sidebarFilters.map((f) => {
            const isActive = activeFilter === f.key
            let count: number | undefined
            if (f.key === 'all') count = contacts.length
            else if (f.key === 'high-priority') count = criticalCount
            else if (f.key === 'champions') count = thrivingCount
            else count = contacts.filter((c) => contactSegmentLabel(c) === f.key).length
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-[6px] text-[13px] text-left transition-all"
                style={{
                  background: isActive ? 'rgba(1,180,175,0.12)' : 'transparent',
                  color: isActive ? 'var(--teal)' : 'var(--muted)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span className="truncate">{f.label}</span>
                {count !== undefined && count > 0 && (
                  <span className="text-[11px] ml-1 px-1.5 py-0.5 rounded-full" style={{ background: isActive ? 'rgba(1,180,175,0.2)' : 'rgba(255,255,255,0.07)', color: isActive ? 'var(--teal)' : 'var(--muted)' }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="px-4 py-4 space-y-2" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Edit Segments</p>
          <input
            value={segmentDraft}
            onChange={(e) => setSegmentDraft(e.target.value)}
            placeholder="New segment name"
            className="w-full px-3 py-2 rounded-[7px] text-[12px] border outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <button
            type="button"
            onClick={addSegment}
            className="w-full px-3 py-2 rounded-[7px] text-[12px] font-medium"
            style={{ background: 'rgba(1,180,175,0.16)', color: 'var(--teal)' }}
          >
            + Add segment
          </button>
          {activeFilter !== 'all' && activeFilter !== 'high-priority' && activeFilter !== 'champions' && (
            <>
              <input
                value={segmentRenameDraft}
                onChange={(e) => setSegmentRenameDraft(e.target.value)}
                placeholder={`Rename ${activeFilter}`}
                className="w-full px-3 py-2 rounded-[7px] text-[12px] border outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={renameActiveSegment}
                className="w-full px-3 py-2 rounded-[7px] text-[12px] font-medium border"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Rename active segment
              </button>
            </>
          )}
        </div>
        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Health</p>
          <div className="space-y-1.5">
            {[
              { label: 'Thriving', score: 90, count: thrivingCount, color: '#22c55e' },
              { label: 'Neglected', score: 50, count: contacts.filter((c) => healthState(c.health) === 'neglected').length, color: '#FFB100' },
              { label: 'Critical', score: 10, count: criticalCount, color: '#DC2626' },
            ].map(({ label, score, count, color }) => (
              <div key={label} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5">
                  <Plumbob score={score} size={14} />
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                </div>
                <span style={{ color }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 className="text-[20px] font-semibold" style={{ color: 'var(--text)' }}>CRM</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>
              {filtered.length} of {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded-[7px] text-[13px] outline-none w-48 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-3 py-2 rounded-[7px] text-[13px] outline-none border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <option value="recent">Recently touched</option>
              <option value="name">Name A-Z</option>
              <option value="health-desc">Health high-low</option>
              <option value="health-asc">Health low-high</option>
            </select>
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 rounded-[7px] text-[13px] font-medium border transition-all"
              style={{ borderColor: 'rgba(1,180,175,0.45)', color: 'var(--teal)', background: 'transparent' }}
            >
              ↑ Import
            </button>
            <button
              onClick={() => setShowAddContact(true)}
              className="px-4 py-2 rounded-[7px] text-[13px] font-medium transition-all"
              style={{ background: 'var(--teal)', color: '#031119' }}
            >
              + Add Contact
            </button>
          </div>
        </header>

        <div className="flex-1 px-6 py-5 overflow-y-auto">
          <ContactTable contacts={filtered} onSelect={setSelectedContact} />
        </div>
      </main>

      {selectedContact && (
        <ProfileDrawer
          contact={contacts.find((c) => c.id === selectedContact.id) ?? selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
      {showImport && <ImportWizard onClose={() => setShowImport(false)} />}
      {showAddContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(2,8,12,0.76)' }}>
          <div className="w-full max-w-xl rounded-[16px] border p-6" style={{ background: '#08161f', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-semibold" style={{ color: 'var(--text)' }}>Add contact</h2>
                <p className="text-[12px] mt-1" style={{ color: 'var(--muted)' }}>Create a contact directly and place them into any segment.</p>
              </div>
              <button type="button" onClick={() => setShowAddContact(false)} style={{ color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input value={newContact.name} onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" className="px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <input value={newContact.email} onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <input value={newContact.phone} onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <input value={newContact.persona} onChange={(e) => setNewContact((prev) => ({ ...prev, persona: e.target.value }))} placeholder="Persona" className="px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <select value={newContact.segment} onChange={(e) => setNewContact((prev) => ({ ...prev, segment: e.target.value }))} className="px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                {['BLV Community', 'Instructor', 'Enterprise', 'Champion', 'General'].map((segment) => (
                  <option key={segment} value={segment}>{segment}</option>
                ))}
              </select>
              <input value={newContact.customSegment} onChange={(e) => setNewContact((prev) => ({ ...prev, customSegment: e.target.value }))} placeholder="Or custom segment" className="px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowAddContact(false)} className="px-4 py-2 rounded-[7px] border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Cancel</button>
              <button type="button" onClick={handleCreateContact} className="px-4 py-2 rounded-[7px] font-medium" style={{ background: 'var(--teal)', color: '#031119' }}>Create contact</button>
            </div>
          </div>
        </div>
      )}
      <ToastStack />
    </div>
  )
}
