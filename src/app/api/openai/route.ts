import type { NextRequest } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('[api/openai] incoming body:', body)

    const message =
      body?.message ??
      body?.query ??
      (body?.term ? `Explain this term in plain English: ${body.term}` : undefined)
    const model = body?.model ?? 'gpt-5-mini'

    if (!message || typeof message !== 'string') {
      return new Response('Missing or invalid message/query/term', { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[api/openai] missing OPENAI_API_KEY')
      return new Response('Missing API key', { status: 500 })
    }

    // Use the Responses API which returns `output_text` / `output` reliably for these models
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: 'You are Domus AI — a concise, helpful assistant for real estate questions.' },
          { role: 'user', content: `${message}\n\nPlease answer concisely in 2-4 short sentences.` }
        ],
        // Increase token budget to avoid truncation (adjust as needed)
        max_output_tokens: 800,
      }),
    })
    const data = await resp.json()

    console.log('[api/openai] full response payload:', JSON.stringify(data))

    // If model reports it was truncated, surface a clear warning to the client
    if (data?.incomplete_details?.reason === 'max_output_tokens') {
      console.warn('[api/openai] response truncated by max_output_tokens:', data.incomplete_details)
      return new Response(JSON.stringify({
        answer: '',
        raw: data,
        warning: 'Model response was truncated (max_output_tokens). Try again or increase max_output_tokens.'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // robust extractor for Responses API and legacy fields
    const extractResponseText = (d: any): string => {
      if (!d) return ''
      if (typeof d.output_text === 'string' && d.output_text.trim()) return d.output_text.trim()

      if (Array.isArray(d.output)) {
        for (const item of d.output) {
          // item.content often contains blocks with .text or nested .content arrays
          const content = item?.content
          if (!content) continue
          const parts: string[] = []
          for (const block of content) {
            if (!block) continue
            if (typeof block === 'string') parts.push(block)
            else if (typeof block.text === 'string') parts.push(block.text)
            else if (Array.isArray(block.content)) {
              for (const sub of block.content) {
                if (typeof sub?.text === 'string') parts.push(sub.text)
              }
            }
            else if (Array.isArray(block.parts)) { // fallback naming
              for (const p of block.parts) if (typeof p?.text === 'string') parts.push(p.text)
            }
          }
          const joined = parts.join('').trim()
          if (joined) return joined
        }
      }

      // legacy chat/completions fallbacks
      const choiceMsg = d?.choices?.[0]?.message?.content
      if (typeof choiceMsg === 'string' && choiceMsg.trim()) return choiceMsg.trim()
      const choiceText = d?.choices?.[0]?.text
      if (typeof choiceText === 'string' && choiceText.trim()) return choiceText.trim()

      return ''
    }

    const reply = extractResponseText(data)

    console.log('[api/openai] extracted reply length:', reply.length)
    if (!reply) console.warn('[api/openai] empty reply - full payload logged above')

    return new Response(JSON.stringify({ answer: String(reply), raw: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[api/openai] unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 502 })
  }
}