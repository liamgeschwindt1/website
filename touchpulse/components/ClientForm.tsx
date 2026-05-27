'use client'

import { useState, useRef, FormEvent } from 'react'
import { track, useSectionView } from '@/lib/posthog'

interface FormState {
  name: string
  email: string
  organisation: string
  role: string
  orgSize: string
  heardAbout: string
  message: string
}

export default function ClientForm() {
  const sectionRef = useRef<HTMLElement>(null)
  useSectionView(sectionRef, 'client_enquiry_form')
  const [hasStarted, setHasStarted] = useState(false)
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    organisation: '',
    role: '',
    orgSize: '',
    heardAbout: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!hasStarted) {
      setHasStarted(true)
      track.formStart('client_enquiry')
    }
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const message = [
      form.message,
      `Role: ${form.role || 'Not specified'}`,
      `Organisation size: ${form.orgSize || 'Not specified'}`,
      `How they heard: ${form.heardAbout || 'Not specified'}`,
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
          company: form.organisation,
          message,
          source: 'client-enquiry',
          type: 'client_lead',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setForm({ name: '', email: '', organisation: '', role: '', orgSize: '', heardAbout: '', message: '' })
        setHasStarted(false)
        track.formSubmit('client_enquiry', true)
      } else {
        setStatus('error')
        track.formSubmit('client_enquiry', false)
      }
    } catch {
      setStatus('error')
      track.formSubmit('client_enquiry', false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-[15px] placeholder-[var(--muted)] focus:border-[var(--teal)] focus:outline-none transition-colors duration-150'

  return (
    <section
      ref={sectionRef}
      id="enquire"
      aria-labelledby="client-form-heading"
      className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-[var(--border)]"
    >
      <div className="max-w-[600px] mx-auto">
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--teal)' }}>
          ✦ Get in touch
        </p>
        <h2
          id="client-form-heading"
          className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-3"
        >
          Enquire about the platform.
        </h2>
        <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-10">
          Tell us about your organisation and we&apos;ll be in touch within one business day to arrange a demo.
        </p>

        {status === 'success' ? (
          <div
            role="alert"
            className="p-6 rounded-[12px] bg-[rgba(1,180,175,0.10)] border border-[rgba(1,180,175,0.35)] text-[var(--teal)] text-[15px]"
          >
            ✓ Enquiry received — someone from the team will be in touch shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client-name" className="block text-[13px] text-[var(--muted)] mb-2">
                  Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="client-name"
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
                <label htmlFor="client-email" className="block text-[13px] text-[var(--muted)] mb-2">
                  Work email <span aria-hidden="true">*</span>
                </label>
                <input
                  id="client-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@organisation.org"
                />
              </div>
            </div>

            <div>
              <label htmlFor="organisation" className="block text-[13px] text-[var(--muted)] mb-2">
                Organisation name <span aria-hidden="true">*</span>
              </label>
              <input
                id="organisation"
                name="organisation"
                type="text"
                required
                autoComplete="organization"
                value={form.organisation}
                onChange={handleChange}
                className={inputClass}
                placeholder="Your organisation"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-[13px] text-[var(--muted)] mb-2">
                  Your role
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select a role</option>
                  <option value="O&M trainer">O&amp;M trainer</option>
                  <option value="Rehab worker">Rehab worker</option>
                  <option value="Service manager">Service manager</option>
                  <option value="Director / CEO">Director / CEO</option>
                  <option value="Procurement / commissioning">Procurement / commissioning</option>
                  <option value="IT / digital">IT / digital</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="orgSize" className="block text-[13px] text-[var(--muted)] mb-2">
                  Number of O&amp;M trainers
                </label>
                <select
                  id="orgSize"
                  name="orgSize"
                  value={form.orgSize}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select a range</option>
                  <option value="Just me (1)">Just me (1)</option>
                  <option value="2–5">2–5</option>
                  <option value="6–20">6–20</option>
                  <option value="21–50">21–50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="client-heardAbout" className="block text-[13px] text-[var(--muted)] mb-2">
                How did you hear about Touchpulse?
              </label>
              <select
                id="client-heardAbout"
                name="heardAbout"
                value={form.heardAbout}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select an option</option>
                <option value="Blind Veterans UK">Blind Veterans UK</option>
                <option value="Colleague or peer">Colleague or peer</option>
                <option value="Conference or event">Conference or event</option>
                <option value="Social media">Social media</option>
                <option value="Search engine">Search engine</option>
                <option value="Email or newsletter">Email or newsletter</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="client-message" className="block text-[13px] text-[var(--muted)] mb-2">
                Tell us about your service <span className="text-[var(--muted)]">(optional)</span>
              </label>
              <textarea
                id="client-message"
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                placeholder="Number of clients, current tools you use, what prompted you to look for a solution…"
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
              className="btn-pill-gold self-start min-w-[200px] mt-2"
            >
              {status === 'loading' ? 'Sending…' : 'Send enquiry →'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
