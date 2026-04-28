import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are an AI content assistant for the TouchPulse CMS admin panel.
TouchPulse is an AI + human-powered navigation app for people with visual impairments.

You can propose changes to any of these content types:
- website_copy: Main site-wide copy (hero section, proofBar stats, ctaBanner — stored as a JSON object)
- page: Individual website pages (title, slug, content in markdown, excerpt, seoTitle, seoDesc, published)
- post: Blog posts (title, slug, content in markdown, excerpt, coverImage URL, published)
- footer: Footer content (markdown string)

IMPORTANT: You MUST respond ONLY with valid JSON in exactly this format — no extra text, no markdown fences:
{
  "reply": "A friendly, concise explanation of what you are proposing or answering",
  "changes": [
    {
      "type": "website_copy" | "page" | "post" | "footer",
      "id": "record id (only for page/post updates — omit when creating new records or for website_copy/footer)",
      "title": "Short label e.g. 'Update hero heading'",
      "description": "What changed and why",
      "after": <complete new content value>
    }
  ]
}

Rules:
- For website_copy: "after" is the FULL website_copy JSON object (preserve all fields, only change what is requested)
- For footer: "after" is the markdown string
- For page/post update: include "id" and set "after" to an object with ALL fields (title, slug, content, excerpt, seoTitle, seoDesc, published)
- For page/post create: omit "id", include all required fields in "after" (title, slug, content, excerpt, published), generate a URL-safe slug
- If the user uploads images or videos, analyze them and suggest appropriate use in content or as cover images — reference the provided media URLs
- If no changes are needed (it's just a question), return an empty "changes" array
- Preserve TouchPulse brand voice: empowering, clear, accessible, human-centered
- Never fabricate facts about TouchPulse — only work with the content provided in the context`

interface MessageIn {
  role: 'user' | 'assistant'
  content: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeminiContent = { role: 'user' | 'model'; parts: any[] }

function buildGeminiHistory(messages: MessageIn[]): GeminiContent[] {
  const result: GeminiContent[] = []
  for (const m of messages) {
    const role: 'user' | 'model' = m.role === 'assistant' ? 'model' : 'user'
    const last = result[result.length - 1]
    if (last && last.role === role) {
      last.parts.push({ text: m.content })
    } else {
      result.push({ role, parts: [{ text: m.content }] })
    }
  }
  return result
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_KEY is not configured' }, { status: 500 })
  }

  try {
    const form = await req.formData()
    const messagesRaw = form.get('messages') as string | null
    const messages: MessageIn[] = messagesRaw ? JSON.parse(messagesRaw) : []
    const files = form.getAll('files') as File[]

    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'No user message provided' }, { status: 400 })
    }

    // Read all file buffers once (prevent double-read on streams)
    const fileData = await Promise.all(
      files.map(async (f) => ({
        name: f.name,
        mimeType: f.type || 'application/octet-stream',
        size: f.size,
        buffer: Buffer.from(await f.arrayBuffer()),
      }))
    )

    // Upload files to media library
    const uploadedMedia = await Promise.all(
      fileData.map(async (fd) => {
        const saved = await prisma.media.create({
          data: {
            filename: fd.name,
            mimeType: fd.mimeType,
            size: fd.size,
            url: '',
            data: fd.buffer,
          },
        })
        return {
          id: saved.id,
          url: `/api/media/${saved.id}`,
          mimeType: fd.mimeType,
          filename: fd.name,
        }
      })
    )

    // Fetch fresh site context from DB
    const [pages, posts, wCopyRow, footerRow, mediaList] = await Promise.all([
      prisma.page.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.post.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.siteContent.findUnique({ where: { key: 'website_copy' } }),
      prisma.siteContent.findUnique({ where: { key: 'footer_content' } }),
      prisma.media.findMany({
        select: { id: true, filename: true, mimeType: true, alt: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    const siteContext = {
      websiteCopy: wCopyRow?.value ? JSON.parse(wCopyRow.value) : null,
      footer: footerRow?.value ?? '',
      pages: pages.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        published: p.published,
        seoTitle: p.seoTitle,
        seoDesc: p.seoDesc,
      })),
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        published: p.published,
        coverImage: p.coverImage,
      })),
      mediaLibrary: [
        ...mediaList.map((m) => ({
          id: m.id,
          filename: m.filename,
          mimeType: m.mimeType,
          alt: m.alt,
          url: `/api/media/${m.id}`,
        })),
        ...uploadedMedia,
      ],
    }

    // Build parts for the current user message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentParts: any[] = []

    // Add images inline as base64 (Gemini multimodal)
    for (const fd of fileData) {
      if (fd.mimeType.startsWith('image/')) {
        currentParts.push({
          inlineData: {
            mimeType: fd.mimeType,
            data: fd.buffer.toString('base64'),
          },
        })
      }
    }

    // Add site context + user message as text
    const userText = messages[messages.length - 1].content
    const contextBlock = [
      'CURRENT SITE CONTENT (use this as the source of truth):',
      JSON.stringify(siteContext, null, 2),
      uploadedMedia.length > 0
        ? `\nNEWLY UPLOADED MEDIA (reference these URLs in your proposals):\n${JSON.stringify(uploadedMedia, null, 2)}`
        : '',
      `\nUSER REQUEST: ${userText}`,
    ]
      .filter(Boolean)
      .join('\n')

    currentParts.push({ text: contextBlock })

    // Build history (everything before the current user message)
    const history = buildGeminiHistory(messages.slice(0, -1))

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    })

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(currentParts)
    const responseText = result.response.text()

    let parsed: { reply: string; changes: unknown[] }
    try {
      parsed = JSON.parse(responseText)
    } catch {
      // If JSON parsing fails, wrap as plain reply
      parsed = { reply: responseText, changes: [] }
    }

    return NextResponse.json({
      reply: parsed.reply ?? 'Done.',
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
      uploadedMedia,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    console.error('[AI Chat]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
