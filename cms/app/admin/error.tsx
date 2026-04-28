'use client'

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[Admin Error]', error)
  }, [error])

  const isDatabaseError =
    error.message?.toLowerCase().includes('prisma') ||
    error.message?.toLowerCase().includes('database') ||
    error.message?.toLowerCase().includes('connection') ||
    error.message?.toLowerCase().includes('p1001') ||
    error.message?.toLowerCase().includes('p2') ||
    !error.message // hidden in production builds

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-8 text-center"
      style={{ background: 'var(--bg)' }}
    >
      <p className="text-4xl mb-5" style={{ opacity: 0.3 }}>⚠</p>
      <h1 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--text)' }}>
        Something went wrong
      </h1>

      {isDatabaseError ? (
        <div className="max-w-md">
          <p className="text-[13px] mb-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
            This page couldn&apos;t load because the database isn&apos;t reachable. This usually means
            one of the following:
          </p>

          <div
            className="rounded-xl border text-left px-4 py-3 mb-6 text-[12px] space-y-2"
            style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--muted)' }}
          >
            <p>• <code className="font-mono" style={{ color: 'var(--text)' }}>DATABASE_URL</code> is not set in Railway environment variables</p>
            <p>• The PostgreSQL service is not running or not linked</p>
            <p>• Prisma migrations haven&apos;t been applied yet — run <code className="font-mono" style={{ color: 'var(--text)' }}>prisma db push</code></p>
          </div>
        </div>
      ) : (
        <p className="text-[13px] mb-6 max-w-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          {error.message || 'An unexpected error occurred while rendering this page.'}
          {error.digest && (
            <span className="block mt-2 font-mono text-[11px] opacity-50">
              digest: {error.digest}
            </span>
          )}
        </p>
      )}

      <button
        type="button"
        onClick={reset}
        className="px-5 py-2 rounded-[8px] text-[13px] font-medium transition-opacity hover:opacity-80"
        style={{ background: 'rgba(1,180,175,0.15)', color: 'var(--teal)', border: '1px solid var(--teal)' }}
      >
        Try again
      </button>
    </div>
  )
}
