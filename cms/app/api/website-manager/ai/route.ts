import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type AIRequest = {
  prompt?: string
  filePath?: string
  content?: string
}

const SYSTEM_PROMPT = `You are a code editing assistant for a Next.js TypeScript website called Touchpulse.
The user will give you a natural-language instruction and the current source code of a file.
Your job is to return the COMPLETE updated file content with the requested change applied.

Rules:
- Return ONLY a JSON object with two keys: "reply" (a short 1-2 sentence explanation of what you changed) and "proposedContent" (the full updated file as a string).
- Never truncate proposedContent. Always return the entire file.
- Preserve all formatting, imports, and TypeScript types.
- Do NOT wrap proposedContent in markdown fences — it must be raw code.
- If the change is not safe or not possible, set proposedContent to null and explain why in reply.`

async function callGemini(prompt: string, filePath: string, content: string): Promise<{ reply: string; proposedContent: string | null }> {
  const apiKey = process.env.GEMINI_KEY
  if (!apiKey) throw new Error('GEMINI_KEY is not configured')

  const userMessage = `File: ${filePath}\n\nInstruction: ${prompt}\n\nCurrent file content:\n\`\`\`\n${content}\n\`\`\``

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Strip markdown fences if Gemini wraps the JSON
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let parsed: { reply?: string; proposedContent?: string | null } = {}
  try {
    parsed = JSON.parse(cleaned) as typeof parsed
  } catch {
    // Gemini didn't return valid JSON — treat raw text as a reply with no proposal
    return { reply: raw.slice(0, 500) || 'Gemini returned an unexpected response.', proposedContent: null }
  }

  return {
    reply: parsed.reply ?? 'Done.',
    proposedContent: typeof parsed.proposedContent === 'string' ? parsed.proposedContent : null,
  }
}

export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as AIRequest | null
  const prompt = payload?.prompt?.trim() ?? ''
  const filePath = payload?.filePath?.trim() ?? ''
  const content = payload?.content ?? ''

  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }
  if (!filePath) {
    return NextResponse.json({ error: 'filePath is required' }, { status: 400 })
  }
  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'content must be a string' }, { status: 400 })
  }

  try {
    const result = await callGemini(prompt, filePath, content)
    return NextResponse.json({
      role: 'assistant',
      filePath,
      reply: result.reply,
      proposedContent: result.proposedContent,
      provider: 'gemini',
    })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'AI request failed' },
      { status: 500 }
    )
  }
}
