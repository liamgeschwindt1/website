import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET — list all submissions (CMS auth required)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = 50
  const skip = (page - 1) * limit

  const [submissions, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactSubmission.count(),
  ])

  return NextResponse.json({ submissions, total, page, pages: Math.ceil(total / limit) })
}

// POST — save a new submission (called from touchpulse, bearer token auth)
export async function POST(req: NextRequest) {
  const secret = process.env.SUBMISSIONS_SECRET
  if (secret) {
    const auth = req.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const body = await req.json()
    const { name, email, company, message, source, ipAddress, userAgent, referrer } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name: String(name).slice(0, 200),
        email: String(email).slice(0, 200),
        company: company ? String(company).slice(0, 200) : null,
        message: String(message).slice(0, 5000),
        source: source ? String(source).slice(0, 100) : 'contact-form',
        ipAddress: ipAddress ? String(ipAddress).slice(0, 50) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
        referrer: referrer ? String(referrer).slice(0, 500) : null,
      },
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
