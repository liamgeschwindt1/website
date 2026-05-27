import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const VALID_TYPES = ['user_access', 'client_lead', 'contact'] as const
type SubmissionType = typeof VALID_TYPES[number]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, message, source, type } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const submissionType: SubmissionType = VALID_TYPES.includes(type) ? type : 'contact'

    // Collect metadata server-side
    const ipAddress = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null
    const userAgent = req.headers.get('user-agent') ?? null
    const referrer = req.headers.get('referer') ?? null
    const timestamp = new Date().toISOString()

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
          body: JSON.stringify({
            name,
            email,
            company,
            message,
            source: source ?? submissionType,
            submissionType,
            pipelineStage: 'new',
            ipAddress,
            userAgent,
            referrer,
          }),
        })
        if (cmsRes.ok) cmsSaved = true
      } catch {
        // CMS unreachable — fall through to n8n
      }
    }

    // Forward to n8n webhook with full metadata
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (webhookUrl) {
      const n8nPayload = {
        submissionType,
        name,
        email,
        company: company ?? null,
        message,
        source: source ?? submissionType,
        ipAddress,
        referrer,
        timestamp,
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }

      // Optional HMAC signing for n8n webhook verification
      const webhookSecret = process.env.N8N_WEBHOOK_SECRET
      if (webhookSecret) {
        const sig = createHmac('sha256', webhookSecret)
          .update(JSON.stringify(n8nPayload))
          .digest('hex')
        headers['x-touchpulse-signature'] = `sha256=${sig}`
      }

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(n8nPayload),
        })
        if (!response.ok) {
          // n8n failed — still return success if CMS saved
          if (!cmsSaved) {
            return NextResponse.json({ error: 'Failed' }, { status: 502 })
          }
        }
      } catch {
        if (!cmsSaved) {
          return NextResponse.json({ error: 'Failed' }, { status: 502 })
        }
      }

      return NextResponse.json({ success: true })
    }

    // No n8n — require CMS save
    if (!cmsSaved) {
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

