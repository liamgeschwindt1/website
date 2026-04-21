'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const nav = [
  {
    label: 'Content',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '⊞' },
      { href: '/admin/posts', label: 'Blog Posts', icon: '✍' },
      { href: '/admin/pages', label: 'Pages', icon: '⬕' },
      { href: '/admin/media', label: 'Media Library', icon: '⊞' },
      { href: '/admin/submissions', label: 'Form Submissions', icon: '✉' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: '◎' },
    ],
  },
  {
    label: 'Site',
    items: [
      { href: '/admin/site', label: 'Site Content', icon: '◈' },
      { href: '/admin/site/nav', label: 'Navigation', icon: '≡' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/pulls', label: 'Pull Requests', icon: '⎇' },
      { href: '/admin/settings', label: 'Settings', icon: '⚙' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[220px] flex flex-col border-r z-40"
      style={{ background: 'rgba(3,12,19,0.98)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-14 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <Image src="/touchpulse-logo.png" alt="TouchPulse" width={120} height={28} className="object-contain" style={{ maxHeight: 28 }} />
        <span
          className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
          style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
        >
          CMS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {nav.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase px-2 mb-2" style={{ color: 'var(--muted)' }}>
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] text-[13px] font-medium no-underline transition-all duration-150"
                      style={
                        active
                          ? { background: 'rgba(1,180,175,0.12)', color: 'var(--teal)' }
                          : { color: 'var(--muted)' }
                      }
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.color = 'var(--text)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--muted)'
                        }
                      }}
                    >
                      <span className="text-[14px] w-4 text-center flex-shrink-0" aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Quick links */}
      <div className="px-3 pb-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        <a
          href="https://touchpulse-production.up.railway.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[12px] no-underline transition-colors duration-150 mb-1"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
        >
          <span aria-hidden="true">↗</span> View live site
        </a>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
          style={{ background: 'rgba(1,180,175,0.2)', color: 'var(--teal)' }}
        >
          {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text)' }}>
            {session?.user?.name ?? 'Admin'}
          </p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="text-[11px] transition-colors duration-150"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--teal)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
