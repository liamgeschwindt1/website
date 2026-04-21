'use client'

import { useState, useEffect, useCallback } from 'react'

interface Submission {
  id: string
  name: string
  email: string
  company: string | null
  message: string
  source: string | null
  ipAddress: string | null
  referrer: string | null
  createdAt: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Submission | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/submissions')
    if (res.ok) {
      const d = await res.json()
      setSubmissions(d.submissions)
      setTotal(d.total)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? submissions.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.company ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : submissions

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* List */}
      <div className="flex flex-col flex-1 min-w-0 border-r" style={{ borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h1 className="text-[20px] font-semibold" style={{ color: 'var(--text)' }}>Form Submissions</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>{total} total</p>
          </div>
          <button type="button" onClick={load} className="px-3 py-1.5 rounded-[6px] text-[12px] border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            ↺ Refresh
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <input
            type="search"
            placeholder="Search by name, email or company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-[7px] text-[13px] border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="text-center py-16 text-[13px]" style={{ color: 'var(--muted)' }}>Loading…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center gap-2">
              <div className="text-[36px]">✉</div>
              <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>No submissions yet</p>
              <p className="text-[13px]" style={{ color: 'var(--muted)' }}>When someone fills out the contact form, it will appear here.</p>
            </div>
          )}
          {!loading && filtered.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s)}
              className="w-full flex items-start gap-4 px-6 py-4 border-b text-left transition-colors"
              style={{
                borderColor: 'var(--border)',
                background: selected?.id === s.id ? 'rgba(1,180,175,0.07)' : 'transparent',
              }}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold" style={{ background: 'rgba(1,180,175,0.15)', color: 'var(--teal)' }}>
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>{s.name}</span>
                  {s.company && <span className="text-[12px]" style={{ color: 'var(--muted)' }}>· {s.company}</span>}
                  {s.source && s.source !== 'contact-form' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium" style={{ color: 'var(--teal)', borderColor: 'rgba(1,180,175,0.3)', background: 'rgba(1,180,175,0.08)' }}>
                      {s.source}
                    </span>
                  )}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>{s.email}</div>
                <div className="text-[13px] mt-1 line-clamp-1" style={{ color: 'rgba(247,247,247,0.45)' }}>{s.message}</div>
              </div>
              <div className="flex-shrink-0 text-[11px]" style={{ color: 'var(--muted)' }}>
                {new Date(s.createdAt).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div className="w-[380px] flex-shrink-0 flex flex-col overflow-y-auto" style={{ background: 'rgba(3,12,19,0.6)' }}>
          <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>Submission detail</h2>
            <button type="button" onClick={() => setSelected(null)} className="text-[18px]" style={{ color: 'var(--muted)' }}>×</button>
          </div>

          <div className="px-6 py-6 flex flex-col gap-5">
            {/* Person */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-semibold flex-shrink-0" style={{ background: 'rgba(1,180,175,0.15)', color: 'var(--teal)' }}>
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>{selected.name}</div>
                <a href={`mailto:${selected.email}`} className="text-[13px] no-underline" style={{ color: 'var(--teal)' }}>{selected.email}</a>
              </div>
            </div>

            <Field label="Company" value={selected.company} />
            <Field label="Source" value={selected.source} />
            <Field label="Received" value={new Date(selected.createdAt).toLocaleString('nl-NL')} />
            <Field label="Referrer" value={selected.referrer} />

            <div>
              <label className="text-[11px] font-semibold tracking-[0.08em] uppercase block mb-2" style={{ color: 'var(--muted)' }}>Message</label>
              <div className="text-[14px] leading-[1.7] whitespace-pre-wrap p-4 rounded-[8px]" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                {selected.message}
              </div>
            </div>

            <a
              href={`mailto:${selected.email}?subject=Re: Your message to TouchPulse`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] font-medium no-underline"
              style={{ background: 'var(--teal)', color: '#031119' }}
            >
              ✉ Reply by email
            </a>
          </div>
        </div>
      ) : (
        <div className="w-[380px] flex-shrink-0 flex items-center justify-center" style={{ color: 'var(--muted)' }}>
          <div className="text-center">
            <div className="text-[32px] mb-3">←</div>
            <p className="text-[13px]">Select a submission to view details</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <label className="text-[11px] font-semibold tracking-[0.08em] uppercase block mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
      <div className="text-[13px]" style={{ color: 'var(--text)' }}>{value}</div>
    </div>
  )
}
