'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { track, useSectionView } from '@/lib/posthog'

interface FormState {
  name: string
  email: string
  company: string
  message: string
}

interface ContactFormProps {
  defaultMessage?: string
}

export default function ContactForm({ defaultMessage = '' }: ContactFormProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useSectionView(sectionRef, 'contact_form')
  const [hasStarted, setHasStarted] = useState(false)
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    company: '',
    message: defaultMessage,
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (defaultMessage) {
      setForm((prev) => ({ ...prev, message: defaultMessage }))
    }
  }, [defaultMessage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!hasStarted) {
      setHasStarted(true)
      track.formStart('contact')
    }
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setForm({ name: '', email: '', company: '', message: '' })
        setHasStarted(false)
        track.formSubmit('contact', true)
      } else {
        setStatus('error')
        track.formSubmit('contact', false)
      }
    } catch {
      setStatus('error')
      track.formSubmit('contact', false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-[15px] placeholder-[var(--muted)] focus:border-[var(--teal)] focus:outline-none transition-colors duration-150'

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-form-heading"
      className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-[var(--border)]"
    >
      <div className="max-w-[600px] mx-auto">
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
          Get in touch
        </p>
        <h2
          id="contact-form-heading"
          className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-3"
        >
          Let&apos;s talk about your space.
        </h2>
        <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-10">
          Fill out the form and a member of the team will be in touch within one business day.
        </p>

        {status === 'success' ? (
          <div
            role="alert"
            className="p-6 rounded-[12px] bg-[rgba(1,180,175,0.10)] border border-[rgba(1,180,175,0.35)] text-[var(--teal)] text-[15px]"
          >
            ✓ Message received — we&apos;ll be in touch shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-[13px] text-[var(--muted)] mb-2">
                  Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="name"
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
                <label htmlFor="email" className="block text-[13px] text-[var(--muted)] mb-2">
                  Email <span aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@organisation.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-[13px] text-[var(--muted)] mb-2">
                Organisation
              </label>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                value={form.company}
                onChange={handleChange}
                className={inputClass}
                placeholder="Your organisation"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-[13px] text-[var(--muted)] mb-2">
                Message <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                className={`${inputClass} resize-y`}
                placeholder="Tell us about your space and what you're hoping to achieve…"
              />
            </div>

            {status === 'error' && (
              <p role="alert" className="text-[14px] text-red-400">
                Something went wrong. Please try again or email us directly at{' '}
                <a href="mailto:info@touchpulse.nl" className="underline">
                  info@touchpulse.nl
                </a>
                .
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 px-[22px] py-[10px] min-h-[44px] rounded-[6px] bg-[var(--gold)] text-[#031119] text-[14px] font-medium border-none cursor-pointer hover:opacity-90 transition-opacity duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending…' : 'Send message ↗'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
