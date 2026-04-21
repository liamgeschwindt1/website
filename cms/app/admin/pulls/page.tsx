'use client'

import { useState, useEffect, useCallback } from 'react'

interface PR {
  number: number
  title: string
  body: string | null
  draft: boolean
  user: string
  created_at: string
  updated_at: string
  html_url: string
  head: { ref: string; sha: string }
  base: { ref: string }
  labels: { name: string; color: string }[]
  ci_status: string | null
}

const PREVIEW_PATTERN = process.env.NEXT_PUBLIC_PREVIEW_URL_PATTERN ?? ''

function getPreviewUrl(pr: PR): string | null {
  if (!PREVIEW_PATTERN) return null
  return PREVIEW_PATTERN.replace('{number}', String(pr.number)).replace('{branch}', pr.head.ref)
}

function CIBadge({ status }: { status: string | null }) {
  if (!status) return null
  const map: Record<string, { label: string; color: string; bg: string }> = {
    success: { label: '✓ Passing', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    failure: { label: '✕ Failed', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
    in_progress: { label: '◌ Running', color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
    pending: { label: '◌ Pending', color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  }
  const s = map[status] ?? { label: status, color: 'var(--muted)', bg: 'transparent' }
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}40` }}>
      {s.label}
    </span>
  )
}

export default function PullRequestsPage() {
  const [pulls, setPulls] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [merging, setMerging] = useState<number | null>(null)
  const [merged, setMerged] = useState<number[]>([])
  const [confirmMerge, setConfirmMerge] = useState<PR | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/github/pulls')
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      setPulls(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load pull requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleMerge(pr: PR) {
    setConfirmMerge(null)
    setMerging(pr.number)
    try {
      const res = await fetch(`/api/github/pulls/${pr.number}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merge_method: 'squash' }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Merge failed') }
      setMerged(prev => [...prev, pr.number])
      setPulls(prev => prev.filter(p => p.number !== pr.number))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Merge failed')
    } finally {
      setMerging(null)
    }
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Pull Requests</h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--muted)' }}>
            Review open changes and publish them to production.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-[6px] text-[13px] border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}
        >
          ↺ Refresh
        </button>
      </div>

      {/* Workflow explanation */}
      <div className="mb-8 p-5 rounded-[12px] border" style={{ borderColor: 'rgba(1,180,175,0.3)', background: 'rgba(1,180,175,0.05)' }}>
        <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--teal)' }}>How versioning works</p>
        <ol className="flex flex-col gap-1">
          {[
            'You or Copilot create an issue from the Site Annotator or request widget.',
            'A developer (or Copilot, if assigned) opens a branch and PR with the fix.',
            'Railway automatically deploys a preview environment for the PR branch.',
            'Review the preview below, then click Publish to merge to main and go live.',
          ].map((step, i) => (
            <li key={i} className="text-[13px] flex gap-2" style={{ color: 'var(--muted)' }}>
              <span className="flex-shrink-0 font-medium" style={{ color: 'var(--teal)' }}>{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {!PREVIEW_PATTERN && (
        <div className="mb-6 p-4 rounded-[10px] border text-[13px]" style={{ borderColor: 'rgba(250,204,21,0.3)', background: 'rgba(250,204,21,0.06)', color: '#facc15' }}>
          <strong>Tip:</strong> Set <code className="mx-1 px-1.5 py-0.5 rounded text-[12px]" style={{ background: 'rgba(255,255,255,0.08)' }}>NEXT_PUBLIC_PREVIEW_URL_PATTERN</code> to show Railway preview links, e.g. <code className="ml-1 px-1.5 py-0.5 rounded text-[12px]" style={{ background: 'rgba(255,255,255,0.08)' }}>https://touchpulse-pr-{'{number}'}.up.railway.app</code>
        </div>
      )}

      {merged.length > 0 && (
        <div className="mb-6 p-4 rounded-[10px] border text-[13px]" style={{ borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.07)', color: '#4ade80' }}>
          ✓ PR #{merged.join(', #')} merged and deploying to production. Changes will be live within a minute.
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-[14px]" style={{ color: 'var(--muted)' }}>Loading pull requests…</div>
      )}

      {error && (
        <div className="p-5 rounded-[10px] border text-[13px]" style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>
          {error === 'GITHUB_TOKEN not configured'
            ? 'GITHUB_TOKEN is not set. Go to Settings → Environment variables to configure it.'
            : error}
        </div>
      )}

      {!loading && !error && pulls.length === 0 && (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <div className="text-[40px]">✓</div>
          <p className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>No open pull requests</p>
          <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Everything is up to date. Create an issue from the Site Annotator to start a change request.</p>
        </div>
      )}

      {!loading && !error && pulls.length > 0 && (
        <div className="flex flex-col gap-4">
          {pulls.map(pr => {
            const previewUrl = getPreviewUrl(pr)
            return (
              <div key={pr.number} className="rounded-[14px] border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 py-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-[12px] font-mono" style={{ color: 'var(--muted)' }}>#{pr.number}</span>
                      {pr.draft && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>Draft</span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(148,184,255,0.1)', color: '#94b8ff', border: '1px solid rgba(148,184,255,0.2)' }}>
                        {pr.head.ref} → {pr.base.ref}
                      </span>
                      <CIBadge status={pr.ci_status} />
                      {pr.labels.map(l => (
                        <span key={l.name} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `#${l.color}20`, color: `#${l.color}`, border: `1px solid #${l.color}50` }}>
                          {l.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-[15px] font-semibold leading-snug mb-1" style={{ color: 'var(--text)' }}>{pr.title}</h3>
                    <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
                      by <span style={{ color: 'var(--text)' }}>{pr.user}</span> · updated {new Date(pr.updated_at).toLocaleDateString()}
                    </p>
                    {pr.body && (
                      <p className="mt-3 text-[13px] leading-[1.6] line-clamp-3" style={{ color: 'var(--muted)' }}>{pr.body}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {previewUrl && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-[7px] text-[13px] font-medium border no-underline transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'rgba(255,255,255,0.04)' }}
                      >
                        ↗ Preview
                      </a>
                    )}
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-[7px] text-[13px] font-medium border no-underline transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}
                    >
                      View on GitHub
                    </a>
                    <button
                      type="button"
                      disabled={pr.draft || merging === pr.number}
                      onClick={() => setConfirmMerge(pr)}
                      className="px-4 py-2 rounded-[7px] text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                      style={{ background: 'var(--teal)', color: '#031119' }}
                    >
                      {merging === pr.number ? 'Merging…' : '✓ Publish'}
                    </button>
                  </div>
                </div>

                {pr.draft && (
                  <div className="px-6 py-2 border-t text-[12px]" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'rgba(255,255,255,0.02)' }}>
                    This PR is a draft — mark it ready for review on GitHub before publishing.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm merge modal */}
      {confirmMerge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div className="w-full max-w-[440px] rounded-[14px] border p-8" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            <h2 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--text)' }}>Publish this change?</h2>
            <p className="text-[13px] mb-1" style={{ color: 'var(--muted)' }}>This will squash-merge:</p>
            <p className="text-[14px] font-medium mb-5" style={{ color: 'var(--text)' }}>#{confirmMerge.number} — {confirmMerge.title}</p>
            <p className="text-[13px] mb-6 leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Merging to <strong style={{ color: 'var(--text)' }}>{confirmMerge.base.ref}</strong> will trigger a Railway deployment. The live site will update within ~2 minutes.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleMerge(confirmMerge)}
                className="flex-1 py-2.5 rounded-[8px] text-[14px] font-medium transition-opacity hover:opacity-90"
                style={{ background: 'var(--teal)', color: '#031119' }}
              >
                Publish now
              </button>
              <button
                type="button"
                onClick={() => setConfirmMerge(null)}
                className="px-5 py-2.5 rounded-[8px] text-[14px] border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
