'use client'

import { useState, useRef, FormEvent } from 'react'
import { track, useSectionView } from '@/lib/posthog'

interface FormState {
  name: string
  email: string
  visionLoss: string
  heardAbout: string
  message: string
}

export default function UserForm() {
  const sectionRef = useRef<HTMLElement>(null)
  useSectionView(sectionRef, 'user_access_form')
  const [hasStarted, setHasStarted] = useState(false)
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    visionLoss: '',
    heardAbout: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!hasStarted) {
      setHasStarted(true)
      track.formStart('user_access')
    }
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const message = [
      form.message,
      `Vision: ${form.visionLoss || 'Not specified'}`,
      `Heard about Tiera: ${form.heardAbout || 'Not specified'}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message,
          source: 'get-tiera',
          type: 'user_access',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setForm({ name: '', email: '', visionLoss: '', heardAbout: '', message: '' })
        setHasStarted(false)
        track.formSubmit('user_access', true)
      } else {
        setStatus('error')
        track.formSubmit('user_access', false)
      }
    } catch {
      setStatus('error')
      track.formSubmit('user_access', false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-[15px] placeholder-[var(--muted)] focus:border-[var(--teal)] focus:outline-none transition-colors duration-150'

  return (
    <section
      ref={sectionRef}
      id="get-tiera"
      aria-labelledby="user-form-heading"
      className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-[var(--border)]"
    >
      <div className="max-w-[600px] mx-auto">
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--teal)' }}>
          ✦ Get Tiera
        </p>
        <h2
          id="user-form-heading"
          className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-3"
        >
          Request access to Tiera.
        </h2>
        <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-10">
          Tell us a little about yourself and we&apos;ll get you set up. Tiera is free for everyone.
        </p>

        {status === 'success' ? (
          <div
            role="alert"
            className="p-6 rounded-[12px] bg-[rgba(1,180,175,0.10)] border border-[rgba(1,180,175,0.35)] text-[var(--teal)] text-[15px]"
          >
            ✓ Request received — we&apos;ll send you access details shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user-name" className="block text-[13px] text-[var(--muted)] mb-2">
                  Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="user-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="user-email" className="block text-[13px] text-[var(--muted)] mb-2">
                  Email <span aria-hidden="true">*</span>
                </label>
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="visionLoss" className="block text-[13px] text-[var(--muted)] mb-2">
                How would you describe your vision?
              </label>
              <select
                id="visionLoss"
                name="visionLoss"
                value={form.visionLoss}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select an option</option>
                <option value="Totally blind">Totally blind</option>
                <option value="Severely sight impaired (legally blind)">Severely sight impaired (legally blind)</option>
                <option value="Sight impaired (partial sight)">Sight impaired (partial sight)</option>
                <option value="Low vision">Low vision</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label htmlFor="heardAbout" className="block text-[13px] text-[var(--muted)] mb-2">
                How did you hear about Tiera?
              </label>
              <select
                id="heardAbout"
                name="heardAbout"
                value={form.heardAbout}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select an option</option>
                <option value="O&M trainer or rehab worker">O&amp;M trainer or rehab worker</option>
                <option value="Sight loss charity">Sight loss charity</option>
                <option value="Friend or family">Friend or family</option>
                <option value="Social media">Social media</option>
                <option value="App Store / Google Play">App Store / Google Play</option>
                <option value="Search engine">Search engine</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="user-message" className="block text-[13px] text-[var(--muted)] mb-2">
                Anything else you&apos;d like us to know? <span className="text-[var(--muted)]">(optional)</span>
              </label>
              <textarea
                id="user-message"
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                placeholder="Tell us about your navigation goals, current challenges, or any questions you have."
              />
            </div>

            {status === 'error' && (
              <p role="alert" className="text-[14px]" style={{ color: '#f87171' }}>
                Something went wrong. Please try again or email us at{' '}
                <a href="mailto:info@touchpulse.nl" className="underline">info@touchpulse.nl</a>.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-pill-gold self-start min-w-[180px] mt-2"
            >
              {status === 'loading' ? 'Sending…' : 'Request access →'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
