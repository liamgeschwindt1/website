import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_STAGES = ['new', 'contacted', 'qualified', 'closed']

/**
 * Incoming webhook from n8n.
 *
 * Secure this endpoint by setting WEBHOOK_SECRET in the CMS environment.
 * n8n should send the secret in the `x-webhook-secret` header.
 *
 * Example n8n HTTP Request node:
 *   URL:    https://your-cms-domain/api/webhooks/n8n
 *   Method: POST
 *   Headers: { "x-webhook-secret": "{{ $env.WEBHOOK_SECRET }}", "Content-Type": "application/json" }
 *   Body:   { "submissionId": "...", "action": "update_stage", "stage": "contacted" }
 *
 * Supported actions:
 *   - update_stage: sets pipelineStage on a ContactSubmission
 */
export async function POST(req: NextRequest) {
  // Validate webhook secret
  const secret = process.env.WEBHOOK_SECRET
  if (secret) {
    const incoming = req.headers.get('x-webhook-secret')
    if (incoming !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { submissionId, action, stage } = body as {
    submissionId?: string
    action?: string
    stage?: string
  }

  if (!submissionId || typeof submissionId !== 'string') {
    return NextResponse.json({ error: 'submissionId required' }, { status: 400 })
  }

  if (action === 'update_stage') {
    if (!stage || !VALID_STAGES.includes(String(stage))) {
      return NextResponse.json(
        { error: `stage must be one of: ${VALID_STAGES.join(', ')}` },
        { status: 400 }
      )
    }

    const updated = await prisma.contactSubmission.updateMany({
      where: { id: submissionId },
      data: { pipelineStage: String(stage) },
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, submissionId, stage })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}
