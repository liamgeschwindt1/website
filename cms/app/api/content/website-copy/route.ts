import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const KEY = 'website_copy'

const DEFAULT_TEMPLATE = {
  hero: {
    badge: 'AI-powered navigation',
    headingLine1: 'Every person.',
    headingHighlight: 'journey.',
    headingLine2: 'With confidence.',
    lead: 'TouchPulse turns any building or street into a clear, confident path — powered by Tiera AI and real human backup.',
    primaryCta: 'Get started ↗',
    secondaryCta: 'See how it works →',
    proofLine: '2.4M routes completed. Real people. Real independence.',
  },
  proofBar: {
    trustedByLabel: 'Trusted by',
    stats: [
      { number: '2.4M', label: 'Routes completed' },
      { number: '2.2B', label: 'People with vision loss globally' },
      { number: '97%', label: 'User satisfaction' },
      { number: '24/7', label: 'Human support available' },
    ],
  },
  ctaBanner: {
    heading: 'Be part of building something that matters.',
    body: 'Whether you join now or wait for December — your involvement makes Tiera better for everyone who needs it.',
    primaryButton: 'Get early access ↗',
    secondaryButton: 'Join the waitlist →',
    earlyAccessMessage: "I'd like early access to the Tiera development app.",
    waitlistMessage: "I'd like to join the waitlist for the December Tiera launch.",
    poweredByLabel: 'Powered by',
  },
}

export async function GET() {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: KEY } })
    const value = row?.value ? JSON.parse(row.value) : DEFAULT_TEMPLATE
    return NextResponse.json({ value })
  } catch (error) {
    console.error('Failed to read website copy:', error)
    return NextResponse.json({ value: DEFAULT_TEMPLATE })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { value } = await req.json()
    if (!value || typeof value !== 'object') {
      return NextResponse.json({ error: 'Invalid website copy payload' }, { status: 400 })
    }

    await prisma.siteContent.upsert({
      where: { key: KEY },
      create: { key: KEY, value: JSON.stringify(value) },
      update: { value: JSON.stringify(value) },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to save website copy:', error)
    return NextResponse.json({ error: 'Failed to save website copy' }, { status: 500 })
  }
}
