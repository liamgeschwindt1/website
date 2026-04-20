'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Incorrect password.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-[360px] rounded-[14px] border p-8"
        style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.30)' }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="text-[15px] font-semibold" style={{ color: 'var(--teal)' }}>TouchPulse</div>
          <div className="text-[12px] mt-1" style={{ color: 'var(--muted)' }}>CMS · Admin access</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--muted)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-[6px] border text-[14px] bg-transparent transition-colors duration-150"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <p className="text-[13px]" style={{ color: '#f87171' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-[6px] text-[14px] font-medium transition-opacity duration-150 disabled:opacity-60"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
