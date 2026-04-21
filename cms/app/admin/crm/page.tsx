'use client'

import { useState, useMemo } from 'react'
import { useCRM, Contact, healthState } from '@/context/CRMContext'
import ContactTable from '@/components/crm/ContactTable'
import ProfileDrawer from '@/components/crm/ProfileDrawer'
import ImportWizard from '@/components/crm/ImportWizard'
import ToastStack from '@/components/crm/ToastStack'
import Plumbob from '@/components/crm/Plumbob'

const SIDEBAR_FILTERS = [
  { key: 'all', label: 'All Contacts' },
  { key: 'high-priority', label: '🔴 High Priority' },
  { key: 'champions', label: '🟢 Champions' },
  { key: 'BLV Community', label: 'BLV Community' },
  { key: 'Instructor', label: 'Instructor' },
  { key: 'Enterprise', label: 'Enterprise' },
  { key: 'Champion', label: 'Champion' },
  { key: 'General', label: 'General' },
] as const

type FilterKey = typeof SIDEBAR_FILTERS[number]['key']

function filterContacts(contacts: Contact[], filter: FilterKey, search: string): Contact[] {
  let result = contacts
  if (filter === 'high-priority') result = result.filter((c) => healthState(c.health) === 'critical')
  else if (filter === 'champions') result = result.filter((c) => healthState(c.health) === 'thriving')
  else if (filter !== 'all') result = result.filter((c) => c.segment === filter)
  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.segment?.toLowerCase().includes(q) ?? false)
    )
  }
  return result
}

export default function CRMPage() {
  const { contacts } = useCRM()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showImport, setShowImport] = useState(false)

  const filtered = useMemo(() => filterContacts(contacts, activeFilter, search), [contacts, activeFilter, search])
  const criticalCount = contacts.filter((c) => healthState(c.health) === 'critical').length
  const thrivingCount = contacts.filter((c) => healthState(c.health) === 'thriving').length

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Segment sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 overflow-y-auto" style={{ width: 200, borderRight: '1px solid var(--border)', background: 'rgba(27,53,79,0.1)' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--muted)' }}>Segments</p>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {SIDEBAR_FILTERS.map((f) => {
            const isActive = activeFilter === f.key
            let count: number | undefined
            if (f.key === 'all') count = contacts.length
            else if (f.key === 'high-priority') count = criticalCount
            else if (f.key === 'champions') count = thrivingCount
            else count = contacts.filter((c) => c.segment === f.key).length
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
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 rounded-[7px] text-[13px] font-medium border transition-all"
              style={{ borderColor: 'rgba(1,180,175,0.45)', color: 'var(--teal)', background: 'transparent' }}
            >
              ↑ Import
            </button>
            <button
              onClick={() => setShowImport(true)}
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
      <ToastStack />
    </div>
  )
}
