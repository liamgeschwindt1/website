'use client'

import { useState, FormEvent } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function ForBusinessPage() {
  const [form, setForm] = useState({ name: '', organisation: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.organisation,
          message: form.message,
          source: 'for-business',
        }),
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-[15px] placeholder-[var(--muted)] focus:border-[var(--teal)] focus:outline-none transition-colors duration-150'

  return (
    <>
      <Nav />
      <main className="pt-[60px]">
        {/* Header */}
        <section
          className="px-[clamp(24px,5vw,80px)] py-[80px] border-b border-[var(--border)]"
          aria-labelledby="for-business-heading"
        >
          <div className="max-w-[680px]">
            <h1
              id="for-business-heading"
              className="text-[clamp(36px,5vw,60px)] font-medium tracking-[-0.03em] leading-[1.1] mb-8 text-[var(--text)]"
            >
              Bring accessible navigation to your organisation.
            </h1>
            <p className="text-[18px] text-[var(--body)] leading-[1.75] mb-12">
              We work with universities, hospitals, transit hubs, and public spaces to deploy Tiera for their visitors and staff. If you are building something accessible and want navigation to be part of it, talk to us.
            </p>

            <div className="flex flex-col gap-10">
              {[
                {
                  heading: 'Universities and campuses.',
                  body: 'Help students and visitors navigate buildings, find entrances, and move between locations independently.',
                },
                {
                  heading: 'Hospitals and healthcare.',
                  body: 'Complex environments where confident navigation matters. We can help.',
                },
                {
                  heading: 'Transit and public spaces.',
                  body: 'Stations, airports, city centres. Navigation that works for everyone who uses your space.',
                },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[17px] text-[var(--body)] leading-[1.7]">
                    <span className="text-[var(--text)] font-medium">{item.heading}</span>{' '}
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="px-[clamp(24px,5vw,80px)] py-[96px]"
        >
          <div className="max-w-[560px]">
            <h2
              id="contact-heading"
              className="text-[clamp(24px,3vw,36px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-10"
            >
              Get in touch
            </h2>

            {status === 'success' ? (
              <div
                role="alert"
                className="p-6 rounded-[12px] bg-[rgba(1,180,175,0.10)] border border-[rgba(1,180,175,0.35)] text-[var(--teal)] text-[15px]"
              >
                ✓ Message received — we&apos;ll be in touch shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  type="text"
                  name="organisation"
                  placeholder="Organisation"
                  autoComplete="organization"
                  value={form.organisation}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
                <textarea
                  name="message"
                  placeholder="Message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                />
                {status === 'error' && (
                  <p role="alert" className="text-[14px] text-red-400">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="self-start inline-flex items-center px-6 py-3 border border-[rgba(255,255,255,0.5)] rounded-[6px] text-[14px] font-medium text-[var(--text)] hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150 disabled:opacity-50 min-h-[44px]"
                >
                  {status === 'loading' ? 'Sending…' : 'Send message ↗'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

