'use client'

import { useState, useEffect } from 'react'

const ENV_VARS = [
  { key: 'GITHUB_TOKEN', desc: 'Personal access token for creating GitHub issues. Needs repo scope (or Issues: Read & write for fine-grained tokens).', required: true },
  { key: 'GITHUB_REPO', desc: 'Target repo for issues (format: owner/repo). Defaults to liamgeschwindt1/website.', required: false },
  { key: 'NEXT_PUBLIC_SITE_URL', desc: 'Live site URL referenced when sending frontend requests. Defaults to https://touchpulse-production.up.railway.app.', required: false },
  { key: 'NEXTAUTH_SECRET', desc: 'NextAuth session signing secret (≥32 chars).', required: true },
  { key: 'NEXTAUTH_URL', desc: 'Full URL of this CMS (no trailing slash).', required: true },
  { key: 'DATABASE_URL', desc: 'PostgreSQL connection string. Auto-injected by Railway.', required: true },
  { key: 'GOOGLE_CLIENT_ID', desc: 'Google OAuth client ID for admin sign-in.', required: true },
  { key: 'GOOGLE_CLIENT_SECRET', desc: 'Google OAuth client secret.', required: true },
]

const ASSIGNEE_OPTIONS = [
  { value: '', label: 'Unassigned', desc: 'Issues are created with no assignee.' },
  { value: 'copilot', label: 'GitHub Copilot', desc: 'Copilot picks up the issue and opens a PR for review. Requires Copilot coding agent enabled on the repo.' },
]

export default function SettingsPage() {
  const [assignee, setAssignee] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings/issues')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.assignee !== undefined) setAssignee(data.assignee ?? '') })
      .catch(() => {})
  }, [])

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/settings/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee: assignee || null }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-[22px] font-semibold tracking-tight mb-2" style={{ color: 'var(--text)' }}>Settings</h1>
      <p className="text-[14px] mb-8" style={{ color: 'var(--muted)' }}>CMS configuration and preferences.</p>

      {/* Issue handling */}
      <section className="mb-10">
        <h2 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Issue handling</h2>
        <p className="text-[13px] mb-5" style={{ color: 'var(--muted)' }}>
          Configure how GitHub issues created from the dev request widget are assigned and handled.
        </p>

        <div className="p-5 rounded-[12px] border flex flex-col gap-5" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--muted)' }}>Assignee</p>
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
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-5 py-2 rounded-[7px] text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--teal)', color: '#031119' }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {saved && <span className="text-[12px]" style={{ color: 'var(--teal)' }}>✓ Saved</span>}
          </div>
        </div>
      </section>

      {/* Environment variables */}
      <section>
        <h2 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Environment variables</h2>
        <p className="text-[13px] mb-5" style={{ color: 'var(--muted)' }}>
          These must be set in Railway → secure-appreciation → CMS service → Variables.
        </p>

        <div className="flex flex-col gap-4">
          {ENV_VARS.map(item => (
            <div key={item.key} className="p-5 rounded-[10px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-[13px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--teal)' }}>{item.key}</code>
                {item.required && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium" style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }}>required</span>
                )}
              </div>
              <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
