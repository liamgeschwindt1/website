'use client'

import React, { useState, useMemo } from 'react'
import { useCRM, Contact, healthState } from '@/context/CRMContext'
import ContactTable from '@/components/crm/ContactTable'
import ProfileDrawer from '@/components/crm/ProfileDrawer'
import ImportWizard from '@/components/crm/ImportWizard'
import ToastStack from '@/components/crm/ToastStack'
import Plumbob from '@/components/crm/Plumbob'

// ─── Sidebar Segment Filters ─────────────────────────────────────────────────

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
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.segment?.toLowerCase().includes(q) ?? false)
    )
  }

  return result
}

// ─── CRM Page Shell ──────────────────────────────────────────────────────────

function CRMPageInner() {
  const { contacts } = useCRM()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showImport, setShowImport] = useState(false)

  const filtered = useMemo(
    () => filterContacts(contacts, activeFilter, search),
    [contacts, activeFilter, search]
  )

  const criticalCount = contacts.filter((c) => healthState(c.health) === 'critical').length
  const thrivingCount = contacts.filter((c) => healthState(c.health) === 'thriving').length

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#031119', color: '#F7F7F7', fontFamily: 'var(--font-inter, Inter, ui-sans-serif)' }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col shrink-0"
        style={{
          width: '220px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(27,53,79,0.12)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-base font-bold tracking-tight" style={{ color: '#01B4AF' }}>
            TouchPulse
          </span>
          <span className="ml-1.5 text-xs font-medium" style={{ color: 'rgba(247,247,247,0.4)' }}>
            CRM
          </span>
        </div>

        {/* Nav filters */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
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
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all text-left"
                style={{
                  background: isActive ? 'rgba(1,180,175,0.12)' : 'transparent',
                  color: isActive ? '#01B4AF' : 'rgba(247,247,247,0.65)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span className="truncate">{f.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className="text-xs ml-1 px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? 'rgba(1,180,175,0.2)' : 'rgba(255,255,255,0.07)',
                      color: isActive ? '#01B4AF' : 'rgba(247,247,247,0.45)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Health Summary */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,247,247,0.35)' }}>
            Health Overview
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Plumbob score={90} size={14} />
                <span style={{ color: 'rgba(247,247,247,0.6)' }}>Thriving</span>
              </div>
              <span style={{ color: '#22c55e' }}>{thrivingCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Plumbob score={50} size={14} />
                <span style={{ color: 'rgba(247,247,247,0.6)' }}>Neglected</span>
              </div>
              <span style={{ color: '#FFB100' }}>
                {contacts.filter((c) => healthState(c.health) === 'neglected').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Plumbob score={10} size={14} />
                <span style={{ color: 'rgba(247,247,247,0.6)' }}>Critical</span>
              </div>
              <span style={{ color: '#DC2626' }}>{criticalCount}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#F7F7F7' }}>
              Contacts Directory
            </h1>
            <p className="text-sm" style={{ color: 'rgba(247,247,247,0.45)' }}>
              {filtered.length} of {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <input
              type="search"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none w-52"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F7F7F7',
              }}
            />

            {/* Import button */}
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 active:scale-[0.97]"
              style={{
                border: '1px solid rgba(1,180,175,0.45)',
                color: '#01B4AF',
                background: 'transparent',
              }}
            >
              ↑ Import Contacts
            </button>

            {/* Add Contact (placeholder) */}
            <button
              onClick={() => alert('Add Contact form — coming soon!')}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: '#01B4AF', color: '#031119' }}
            >
              + Add Contact
            </button>
          </div>
        </header>

        {/* Table */}
        <div className="flex-1 px-6 py-5">
          <ContactTable contacts={filtered} onSelect={setSelectedContact} />
        </div>
      </main>

      {/* ── Profile Drawer ───────────────────────────────────────────────── */}
      {selectedContact && (
        <ProfileDrawer
          contact={contacts.find((c) => c.id === selectedContact.id) ?? selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}

      {/* ── Import Wizard ────────────────────────────────────────────────── */}
      {showImport && <ImportWizard onClose={() => setShowImport(false)} />}

      {/* ── Toast Stack ──────────────────────────────────────────────────── */}
      <ToastStack />
    </div>
  )
}

export default function CRMPage() {
  return <CRMPageInner />
}
