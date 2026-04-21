'use client'

import React, { useEffect } from 'react'
import { useCRM } from '@/context/CRMContext'

export default function ToastStack() {
  const { toasts, removeToast } = useCRM()

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl"
          style={{
            background:
              t.type === 'error'
                ? 'rgba(220,38,38,0.95)'
                : t.type === 'info'
                ? 'rgba(1,180,175,0.15)'
                : 'rgba(1,180,175,0.15)',
            border:
              t.type === 'error'
                ? '1px solid #DC2626'
                : '1px solid rgba(1,180,175,0.45)',
            color: '#F7F7F7',
            backdropFilter: 'blur(12px)',
            maxWidth: '360px',
          }}
        >
          <span className="flex-1">{t.text}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity leading-none mt-0.5"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
