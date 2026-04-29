'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { applyTheme } from '@/lib/themes'

const THEMES = [
  { id: 'default', name: 'Default', preview: '#031119' },
  { id: 'touch-grass', name: 'Touch Grass', preview: '#0a1f0f' },
  { id: 'pink-perfect', name: 'Pink Perfect', preview: '#1a0f18' },
  { id: 'deep-ocean', name: 'Deep Ocean', preview: '#0a1628' },
  { id: 'sunset-glow', name: 'Sunset Glow', preview: '#1a0d00' },
]

const ASSIGNEE_OPTIONS = [
  { value: '', label: 'Unassigned', desc: 'Issues created with no assignee.' },
  { value: 'copilot', label: 'GitHub Copilot', desc: 'Copilot picks up the issue and opens a PR. Requires Copilot coding agent on the repo.' },
]

type UserRole = 'admin' | 'editor' | 'viewer'
type RoleEntry = { email: string; role: UserRole }

export default function SettingsPage() {
  const { data: session } = useSession()
  const role = ((session?.user as { role?: string } | undefined)?.role ?? 'editor') as UserRole

  // Theme
  const [theme, setTheme] = useState('default')
  const [themeSaving, setThemeSaving] = useState(false)
  const [themeSaved, setThemeSaved] = useState(false)

  // GitHub assignee
  const [assignee, setAssignee] = useState('')
  const [assigneeSaving, setAssigneeSaving] = useState(false)
  const [assigneeSaved, setAssigneeSaved] = useState(false)

  // Team & Roles
  const [entries, setEntries] = useState<RoleEntry[]>([])
  const [draftEmail, setDraftEmail] = useState('')
  const [draftRole, setDraftRole] = useState<UserRole>('editor')
  const [rolesSaving, setRolesSaving] = useState(false)
  const [rolesMsg, setRolesMsg] = useState('')

  useEffect(() => {
    fetch('/api/settings/themes')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.themeId) setTheme(data.themeId) })
      .catch(() => {})

    fetch('/api/settings/issues')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.assignee !== undefined) setAssignee(data.assignee ?? '') })
      .catch(() => {})

    if (role === 'admin') {
      fetch('/api/admin/roles')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.entries) setEntries(data.entries) })
        .catch(() => {})
    }
  }, [role])

  async function saveTheme() {
    setThemeSaving(true)
    try {
      await fetch('/api/settings/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: theme }),
      })
      applyTheme(theme)
      setThemeSaved(true)
      setTimeout(() => setThemeSaved(false), 2500)
    } finally {
      setThemeSaving(false)
    }
  }

  async function saveAssignee() {
    setAssigneeSaving(true)
    try {
      await fetch('/api/settings/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee: assignee || null }),
      })
      setAssigneeSaved(true)
      setTimeout(() => setAssigneeSaved(false), 2500)
    } finally {
      setAssigneeSaving(false)
    }
  }

  function upsertEntry() {
    const email = draftEmail.trim().toLowerCase()
    if (!email) return
    setEntries(prev => {
      const existing = prev.find(e => e.email === email)
      if (existing) return prev.map(e => e.email === email ? { ...e, role: draftRole } : e)
      return [...prev, { email, role: draftRole }].sort((a, b) => a.email.localeCompare(b.email))
    })
    setDraftEmail('')
    setDraftRole('editor')
  }

  async function saveRoles() {
    setRolesSaving(true)
    setRolesMsg('')
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setRolesMsg('Saved')
    } catch {
      setRolesMsg('Failed to save roles')
    } finally {
      setRolesSaving(false)
    }
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-[22px] font-semibold tracking-tight mb-2" style={{ color: 'var(--text)' }}>Settings</h1>
      <p className="text-[14px] mb-8" style={{ color: 'var(--muted)' }}>CMS configuration and preferences.</p>

      {/* Section 1 — Theme */}
      <section className="mb-10">
        <h2 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Theme</h2>
        <p className="text-[13px] mb-5" style={{ color: 'var(--muted)' }}>Choose a color scheme for the CMS.</p>
        <div className="p-5 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
            {THEMES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-[10px] border-2 transition-all duration-150"
                style={theme === t.id
                  ? { borderColor: 'var(--teal)', background: 'rgba(1,180,175,0.1)' }
                  : { borderColor: 'var(--border)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="w-10 h-10 rounded-[6px] border" style={{ background: t.preview, borderColor: 'var(--border)' }} />
                <span className="text-[11px] font-medium text-center leading-[1.2]" style={{ color: 'var(--text)' }}>{t.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveTheme}
              disabled={themeSaving}
              className="px-5 py-2 rounded-[7px] text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--teal)', color: '#031119' }}
            >
              {themeSaving ? 'Saving…' : 'Apply theme'}
            </button>
            {themeSaved && <span className="text-[12px]" style={{ color: 'var(--teal)' }}>✓ Applied</span>}
          </div>
        </div>
      </section>

      {/* Section 2 — GitHub */}
      <section className="mb-10">
        <h2 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text)' }}>GitHub</h2>
        <p className="text-[13px] mb-5" style={{ color: 'var(--muted)' }}>Configure how issues created from the dev request widget are assigned.</p>
        <div className="p-5 rounded-[12px] border flex flex-col gap-4" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
          <div className="flex flex-col gap-2">
            {ASSIGNEE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-4 rounded-[9px] border cursor-pointer transition-all duration-150"
                style={assignee === opt.value
                  ? { borderColor: 'var(--teal)', background: 'rgba(1,180,175,0.07)' }
                  : { borderColor: 'var(--border)', background: 'rgba(255,255,255,0.02)' }}
              >
                <input
                  type="radio"
                  name="assignee"
                  value={opt.value}
                  checked={assignee === opt.value}
                  onChange={() => setAssignee(opt.value)}
                  className="mt-0.5 flex-shrink-0 accent-[var(--teal)]"
                />
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{opt.label}</p>
                  <p className="text-[12px] mt-0.5 leading-[1.5]" style={{ color: 'var(--muted)' }}>{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveAssignee}
              disabled={assigneeSaving}
              className="px-5 py-2 rounded-[7px] text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--teal)', color: '#031119' }}
            >
              {assigneeSaving ? 'Saving…' : 'Save'}
            </button>
            {assigneeSaved && <span className="text-[12px]" style={{ color: 'var(--teal)' }}>✓ Saved</span>}
          </div>
        </div>
      </section>

      {/* Section 3 — Team & Roles (admin only) */}
      {role === 'admin' && (
        <section>
          <h2 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Team &amp; Roles</h2>
          <p className="text-[13px] mb-5" style={{ color: 'var(--muted)' }}>Assign roles by email. Unlisted @touchpulse.nl users default to editor access.</p>

          <div className="rounded-[12px] border p-5 mb-4" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
            <div className="grid md:grid-cols-[1fr_160px_auto] gap-3">
              <input
                value={draftEmail}
                onChange={e => setDraftEmail(e.target.value)}
                placeholder="name@touchpulse.nl"
                className="px-3 py-2 rounded-[7px] border"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <select
                value={draftRole}
                onChange={e => setDraftRole(e.target.value as UserRole)}
                className="px-3 py-2 rounded-[7px] border"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="button"
                onClick={upsertEntry}
                className="px-4 py-2 rounded-[7px] font-medium text-[13px]"
                style={{ background: 'var(--teal)', color: '#031119' }}
              >
                Add / update
              </button>
            </div>
          </div>

          <div className="rounded-[12px] border overflow-hidden mb-4" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(27,53,79,0.35)' }}>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-[0.06em]" style={{ color: 'var(--muted)' }}>Email</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-[0.06em]" style={{ color: 'var(--muted)' }}>Role</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.email} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <td className="px-5 py-3 text-[14px]" style={{ color: 'var(--text)' }}>{entry.email}</td>
                    <td className="px-5 py-3">
                      <select
                        value={entry.role}
                        onChange={e => setEntries(prev => prev.map(r => r.email === entry.email ? { ...r, role: e.target.value as UserRole } : r))}
                        className="px-2 py-1 rounded-[5px] border text-[12px]"
                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEntries(prev => prev.filter(r => r.email !== entry.email))}
                        className="text-[12px]"
                        style={{ color: '#f87171' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-[13px] text-center" style={{ color: 'var(--muted)' }}>
                      No explicit role assignments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveRoles}
              disabled={rolesSaving}
              className="px-5 py-2 rounded-[7px] text-[13px] font-medium disabled:opacity-50"
              style={{ background: 'var(--teal)', color: '#031119' }}
            >
              {rolesSaving ? 'Saving…' : 'Save roles'}
            </button>
            {rolesMsg && (
              <span className="text-[12px]" style={{ color: rolesMsg === 'Saved' ? 'var(--teal)' : '#f87171' }}>
                {rolesMsg}
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
