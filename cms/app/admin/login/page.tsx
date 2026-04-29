'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/admin')
    }
  }, [status, router])

  const errorMessage =
    error === 'AccessDenied'
      ? 'Access denied. Only @touchpulse.nl Google accounts are allowed.'
      : error === 'Configuration'
      ? 'Google sign-in is not yet configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_SECRET in Railway environment variables.'
      : error === 'OAuthSignin' || error === 'OAuthCallback' || error === 'OAuthCreateAccount'
      ? 'Google sign-in failed. Please try again.'
      : error
      ? `Sign-in error: ${error}`
      : null

  return (
    <div
      className="w-full max-w-[360px] rounded-[14px] border p-8"
      style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.30)' }}
    >
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-2">
          <Image src="/images/touchpulse-logo.png" alt="TouchPulse" width={140} height={34} className="object-contain" />
        </div>
        <div className="text-[12px] mt-1" style={{ color: 'var(--muted)' }}>CMS · Admin access</div>
      </div>

      {errorMessage && (
        <div
          className="mb-5 px-4 py-3 rounded-[8px] text-[13px] text-center"
          style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.35)', color: '#f87171' }}
        >
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/admin' })}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-[8px] border text-[14px] font-medium transition-all duration-150"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--text)',
          background: 'rgba(255,255,255,0.04)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>

      <p className="mt-5 text-center text-[11px]" style={{ color: 'var(--muted)' }}>
        Only @touchpulse.nl accounts are permitted.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
