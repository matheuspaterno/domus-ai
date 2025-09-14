import type { NextRequest } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('[api/openai] incoming body:', body)

    const message =
      body?.message ??
      body?.query ??
      (body?.term ? `Explain this term in plain English: ${body.term}` : undefined)

    // Force the model to GPT-4 on the server regardless of client-sent model
    const model = 'gpt-4'
    if (body?.model && body.model !== model) {
      console.warn(`[api/openai] client requested model ${body.model} - overriding to ${model}`)
    }

    if (!message || typeof message !== 'string') {
      return new Response('Missing or invalid message/query/term', { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[api/openai] missing OPENAI_API_KEY')
      return new Response('Missing API key', { status: 500 })
    }

    // Per-IP daily interaction limit (Upstash Redis, fallback to memory)
    const ip = (req as any).headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() || (req as any).headers?.get?.('x-real-ip') || ''
    const MAX_DAILY = 8
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    let overLimit = false
    if (ip && redisUrl && redisToken) {
      try {
        const { Redis } = await import('@upstash/redis')
        const redis = new Redis({ url: redisUrl, token: redisToken })
        const dateKey = new Date().toISOString().slice(0,10)
        const key = `domus:ip:${ip}:${dateKey}`
        const n = await redis.incr(key)
        if (n === 1) await redis.expire(key, 86400)
        if (n > MAX_DAILY) overLimit = true
      } catch (e) {
        console.warn('[api/openai] Upstash unavailable, falling back to memory')
        ;(globalThis as any).__domus_ip_daily__ = (globalThis as any).__domus_ip_daily__ || new Map<string, { count: number; windowStart: number }>()
        const daily: Map<string, { count: number; windowStart: number }> = (globalThis as any).__domus_ip_daily__
        const DAY_MS = 86400_000
        const now = Date.now()
        const bucket = daily.get(ip)
        if (!bucket || now - bucket.windowStart > DAY_MS) daily.set(ip, { count: 1, windowStart: now })
        else { bucket.count += 1; if (bucket.count > MAX_DAILY) overLimit = true }
      }
    }
    if (overLimit) {
      return new Response(JSON.stringify({
        answer: 'You have reached the limit of messages in this interaction (we are in beta). Please wait 24 hours or reach us in the "Contact a Real Estate Agent" form below for more information.',
        limit: MAX_DAILY,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // quick server-side filter: refuse obvious off-topic queries immediately
    const lower = String(message).toLowerCase()
    const banned = [
      // politics / government
      'politic', 'politics', 'election', 'president', 'senate', 'congress', 'government', 'party', 'campaign',
      // weather / climate
      'weather', 'forecast', 'rain', 'temperature', 'storm', 'climate', 'heatwave', 'hurricane',
      // other common off-topic categories
      'sports', 'score', 'movie', 'film', 'music', 'song', 'celebrity', 'stock', 'market crash', 'crypto',
      'health', 'doctor', 'symptom', 'covid', 'vaccine'
    ]

    const containsBanned = (txt: string | undefined) => {
      if (!txt) return false
      const s = String(txt).toLowerCase()
      return banned.some((kw) => s.includes(kw))
    }

    if (containsBanned(lower)) {
      return new Response(JSON.stringify({ answer: 'I can only answer real estate related questions.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
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
          { role: 'system', content: 'You are Domus AI — a concise, helpful assistant specialized in real estate. Persona: Domus AI builds the future of real estate research and automation. Whether the user is an agent, investor, or a first-time homebuyer, you deliver AI-powered insights to help them make smarter decisions — from neighborhood trends to lead discovery and lien alerts. ONLY answer questions directly related to real estate, property, housing, mortgages, home buying, selling, investing, property law, zoning, liens, valuations, or comparable market analysis. If the user asks about topics outside real estate (for example: politics, weather, sports, entertainment, health, general news, or finance unrelated to property investing), reply exactly: "I can only answer real estate related questions." Do NOT provide any additional information or attempt to answer off-topic requests. After answering, if it would genuinely help the user (e.g., they are buying/selling/investing or need personalized assistance), you may add ONE friendly line suggesting they reach out via the "Contact a Real Estate Agent" form below so Domus AI can match them with an agent. Keep it very light and do this at most once.' },
          { role: 'user', content: `${message}\n\nPlease answer concisely in 2-4 short sentences.` }
        ],
        // Increase token budget to avoid truncation (adjust as needed)
        max_output_tokens: 800,
      }),
    })

    // parse response body safely
    let data: any = null
    try { data = await resp.json() } catch (e) { data = null }

    console.log('[api/openai] full response payload:', JSON.stringify(data))

    // If upstream returned an error (401/429/etc), surface a safe diagnostic to the caller
    if (!resp.ok) {
      console.error('[api/openai] upstream error', resp.status, data)
      return new Response(JSON.stringify({ error: 'Upstream OpenAI error', status: resp.status, details: data }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

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

    // Post-response safety: if the model's reply appears to include banned topics or is off-topic,
    // replace with the canned real-estate-only message to guarantee policy.
    if (containsBanned(reply)) {
      console.warn('[api/openai] reply contained banned topic; replacing with canned message')
      return new Response(JSON.stringify({ answer: 'I can only answer real estate related questions.' , raw: data}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ answer: String(reply), raw: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[api/openai] unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 502 })
  }
}