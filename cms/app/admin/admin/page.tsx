'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

type UserRole = 'admin' | 'editor' | 'viewer'

type RoleEntry = {
  email: string
  role: UserRole
}

export default function AdminPrivilegesPage() {
  const { data: session, status } = useSession()
  const sessionRole = ((session?.user as { role?: string } | undefined)?.role ?? 'editor') as UserRole
  const [entries, setEntries] = useState<RoleEntry[]>([])
  const [draftEmail, setDraftEmail] = useState('')
  const [draftRole, setDraftRole] = useState<UserRole>('editor')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (sessionRole !== 'admin') return
    fetch('/api/admin/roles')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load roles'))))
      .then((data) => setEntries(data.entries ?? []))
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Failed to load roles'))
  }, [sessionRole])

  if (status === 'loading') {
    return <div className="px-8 py-8" style={{ color: 'var(--muted)' }}>Loading…</div>
  }

  if (sessionRole !== 'admin') {
    return (
      <div className="px-8 py-8 max-w-2xl">
        <h1 className="text-[22px] font-semibold tracking-tight mb-2" style={{ color: 'var(--text)' }}>Admin</h1>
        <p className="text-[14px]" style={{ color: 'var(--muted)' }}>Only admins can manage role assignments.</p>
      </div>
    )
  }

  function upsertEntry() {
    const email = draftEmail.trim().toLowerCase()
    if (!email) return
    setEntries((prev) => {
      const existing = prev.find((entry) => entry.email === email)
      if (existing) {
        return prev.map((entry) => (entry.email === email ? { ...entry, role: draftRole } : entry))
      }
      return [...prev, { email, role: draftRole }].sort((left, right) => left.email.localeCompare(right.email))
    })
    setDraftEmail('')
    setDraftRole('editor')
  }

  async function saveEntries() {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      if (!res.ok) throw new Error('Failed to save roles')
      setMessage('Saved')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save roles')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Admin</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--muted)' }}>Assign privileges by email. Unlisted TouchPulse users default to editor access.</p>
      </div>

      <div className="rounded-[12px] border p-5 mb-6" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
        <div className="grid md:grid-cols-[1fr_180px_auto] gap-3">
          <input value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} placeholder="name@touchpulse.nl" className="px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          <select value={draftRole} onChange={(e) => setDraftRole(e.target.value as UserRole)} className="px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="button" onClick={upsertEntry} className="px-4 py-2 rounded-[7px] font-medium" style={{ background: 'var(--teal)', color: '#031119' }}>Add / update</button>
        </div>
      </div>

      <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(27,53,79,0.35)' }}>
              <th className="px-5 py-3 text-[11px] uppercase tracking-[0.06em]" style={{ color: 'var(--muted)' }}>Email</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-[0.06em]" style={{ color: 'var(--muted)' }}>Role</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.email} style={{ borderTop: index === 0 ? 'none' : '1px solid var(--border)' }}>
                <td className="px-5 py-3 text-[14px]" style={{ color: 'var(--text)' }}>{entry.email}</td>
                <td className="px-5 py-3 text-[13px]" style={{ color: 'var(--muted)' }}>{entry.role}</td>
                <td className="px-5 py-3 text-right">
                  <button type="button" onClick={() => setEntries((prev) => prev.filter((item) => item.email !== entry.email))} className="text-[12px]" style={{ color: '#f87171' }}>Remove</button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-[13px] text-center" style={{ color: 'var(--muted)' }}>No explicit role assignments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button type="button" onClick={saveEntries} disabled={saving} className="px-5 py-2 rounded-[7px] text-[13px] font-medium disabled:opacity-50" style={{ background: 'var(--teal)', color: '#031119' }}>
          {saving ? 'Saving…' : 'Save roles'}
        </button>
        {message && <span className="text-[12px]" style={{ color: message === 'Saved' ? 'var(--teal)' : '#f87171' }}>{message}</span>}
      </div>
    </div>
  )
}