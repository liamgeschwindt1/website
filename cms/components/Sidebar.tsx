'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

const nav = [
  {
    label: 'Website Manager',
    items: [
      { href: '/admin/ai', label: 'AI Assistant', icon: '◈' },
      { href: '/admin/website-manager', label: 'Editor + AI', icon: '✦' },
      { href: '/admin/design', label: 'Live Preview', icon: '⬡' },
      { href: '/admin/pulls', label: 'Production PRs', icon: '↗' },
    ],
  },
  {
    label: 'Website',
    items: [
      { href: '/admin/content', label: 'Content', icon: '▤' },
      { href: '/admin/media', label: 'Media', icon: '▣' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/admin', label: 'Admin', icon: '⚑' },
      { href: '/admin/integrations', label: 'Integrations', icon: '⎇' },
      { href: '/admin/settings', label: 'Settings', icon: '⚙' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const role = (session?.user as { role?: string } | undefined)?.role ?? 'editor'

  const visibleNav = nav.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.href !== '/admin/admin' || role === 'admin'),
  }))

  function toggle() {
    setCollapsed(c => {
      const next = !c
      document.documentElement.style.setProperty('--sidebar-w', next ? '52px' : '220px')
      return next
    })
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const w = collapsed ? 52 : 220

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col border-r z-40 transition-[width] duration-200 overflow-hidden"
      style={{ width: w, background: 'rgba(3,12,19,0.98)', borderColor: 'var(--border)' }}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center h-14 border-b flex-shrink-0 relative" style={{ borderColor: 'var(--border)', paddingLeft: collapsed ? 0 : 20 }}>
        {!collapsed && (
          <>
            <Image src="/touchpulse-logo.png" alt="TouchPulse" width={100} height={24} className="object-contain flex-shrink-0" style={{ maxHeight: 24 }} />
            <span
              className="ml-2 text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0"
              style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
            >
              Manager
            </span>
          </>
        )}
        <button
          type="button"
          onClick={toggle}
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center transition-colors duration-150"
          style={{ width: 36, color: 'var(--muted)', flexShrink: 0 }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4" style={{ paddingLeft: collapsed ? 6 : 12, paddingRight: collapsed ? 6 : 12 }}>
        {visibleNav.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <p className="text-[10px] font-semibold tracking-[0.1em] uppercase px-2 mb-2" style={{ color: 'var(--muted)' }}>
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-px mb-3 mx-1" style={{ background: 'var(--border)' }} />}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center rounded-[6px] text-[13px] font-medium no-underline transition-all duration-150"
                      style={{
                        gap: collapsed ? 0 : 10,
                        padding: collapsed ? '7px 0' : '6px 8px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        ...(active
                          ? { background: 'rgba(1,180,175,0.12)', color: 'var(--teal)' }
                          : { color: 'var(--muted)' }),
                      }}
                      title={collapsed ? item.label : undefined}
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
                      <span className="text-[15px] w-5 text-center flex-shrink-0" aria-hidden="true">{item.icon}</span>
                      {!collapsed && item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Quick links */}
      {!collapsed && (
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
      )}

      {/* User */}
      <div
        className="border-t flex items-center"
        style={{
          borderColor: 'var(--border)',
          padding: collapsed ? '10px 0' : '10px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 12,
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
          style={{ background: 'rgba(1,180,175,0.2)', color: 'var(--teal)' }}
          title={collapsed ? (session?.user?.name ?? 'Admin') : undefined}
        >
          {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text)' }}>
              {session?.user?.name ?? 'Admin'}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
              {role}
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
        )}
      </div>
    </aside>
  )
}
