import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type AIRequest = {
  prompt?: string
  filePath?: string
  content?: string
}

function generatePlaceholderProposal(prompt: string, content: string) {
  const replaceMatch = prompt.match(/replace\s+"([^"]+)"\s+with\s+"([^"]+)"/i)
  if (replaceMatch) {
    const oldText = replaceMatch[1]
    const newText = replaceMatch[2]
    if (!content.includes(oldText)) {
      return {
        reply: `I could not find \"${oldText}\" in this file. Try another selection or edit manually.`,
        proposedContent: null as string | null,
      }
    }

    return {
      reply: `I prepared a draft replacing \"${oldText}\" with \"${newText}\". Review and apply if it looks right.`,
      proposedContent: content.replaceAll(oldText, newText),
    }
  }

  const appendMatch = prompt.match(/append\s+"([^"]+)"/i)
  if (appendMatch) {
    const line = appendMatch[1]
    const separator = content.endsWith('\n') ? '' : '\n'
    return {
      reply: 'I prepared a draft that appends your requested line at the end of the file.',
      proposedContent: `${content}${separator}${line}\n`,
    }
  }

  return {
    reply:
      'Placeholder AI is active. Connect Gemini later by replacing this route. For now, you can ask: replace "old" with "new" or append "line" to generate a draft edit.',
    proposedContent: null as string | null,
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

  const generated = generatePlaceholderProposal(prompt, content)

  return NextResponse.json({
    role: 'assistant',
    filePath,
    reply: generated.reply,
    proposedContent: generated.proposedContent,
    provider: 'placeholder',
  })
}
