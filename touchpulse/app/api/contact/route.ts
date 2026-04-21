import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, message, source } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Collect metadata for CMS (stripped of personal data risks)
    const ipAddress = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null
    const userAgent = req.headers.get('user-agent') ?? null
    const referrer = req.headers.get('referer') ?? null

    // Save to CMS database
    const cmsUrl = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL
    const cmsSecret = process.env.SUBMISSIONS_SECRET
    let cmsSaved = false
    if (cmsUrl) {
      try {
        const cmsRes = await fetch(`${cmsUrl}/api/submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cmsSecret ? { Authorization: `Bearer ${cmsSecret}` } : {}),
          },
          body: JSON.stringify({ name, email, company, message, source: source ?? 'contact-form', ipAddress, userAgent, referrer }),
        })
        if (cmsRes.ok) cmsSaved = true
      } catch {
        // CMS unreachable — fall through to n8n
      }
    }

    // Forward to n8n webhook (existing)
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, message }),
      })
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed' }, { status: 502 })
      }
      return NextResponse.json({ success: true })
    }

    // If no n8n webhook, require CMS save to have worked
    if (!cmsSaved) {
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

