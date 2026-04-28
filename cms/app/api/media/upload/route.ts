import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

const s3 = new S3Client({
  region: process.env.RAILWAY_STORAGE_REGION,
  endpoint: process.env.RAILWAY_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.RAILWAY_STORAGE_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.RAILWAY_STORAGE_SECRET_ACCESS_KEY ?? '',
  },
})

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function normalizeEndpoint(endpoint: string) {
  return endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const endpoint = requiredEnv('RAILWAY_STORAGE_ENDPOINT')
    const bucket = requiredEnv('RAILWAY_STORAGE_BUCKET')

    const form = await req.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const originalFilename = sanitizeFilename(file.name || 'upload.bin')
    const key = `media/${Date.now()}-${originalFilename}`
    const body = Buffer.from(await file.arrayBuffer())

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: file.type || 'application/octet-stream',
        ACL: 'public-read',
      }),
    )

    const publicUrl = `${normalizeEndpoint(endpoint)}/${bucket}/${key}`
    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
