'use client'

import { useSession, signOut } from 'next-auth/react'

export default function AdminHeader() {
  const { data: session } = useSession()

  return (
    <header
      className="flex items-center justify-between px-8 h-14 border-b"
      style={{ borderColor: 'var(--border)', background: 'rgba(3,17,25,0.95)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--teal)' }}>
          TouchPulse
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full border" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
          CMS
        </span>
      </div>

      <div className="flex items-center gap-4">
        {session?.user && (
          <span className="text-[12px]" style={{ color: 'var(--muted)' }}>
            {session.user.name ?? session.user.email}
          </span>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="text-[12px] px-3 py-1.5 rounded-[6px] border transition-colors duration-150"
          style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--muted)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
