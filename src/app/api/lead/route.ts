import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type RecaptchaResponse = {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()
    const token = String(body?.token || '')
    const action = String(body?.action || 'contact_form')

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY
    if (!secret) {
      console.error('[api/lead] Missing RECAPTCHA_SECRET_KEY env')
      return new Response(JSON.stringify({ error: 'Captcha not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing captcha token' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Verify reCAPTCHA v3 token with Google
    const params = new URLSearchParams()
    params.set('secret', secret)
    params.set('response', token)
    const verifyResp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    let verify: RecaptchaResponse | null = null
    try { verify = await verifyResp.json() } catch { verify = null }

    if (!verifyResp.ok || !verify?.success) {
      console.warn('[api/lead] Captcha failed', verify)
      return new Response(JSON.stringify({ error: 'Captcha verification failed' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // basic score/action checks (tunable threshold)
    if (typeof verify.score === 'number' && verify.score < 0.5) {
      console.warn('[api/lead] Low captcha score', verify.score)
      return new Response(JSON.stringify({ error: 'Captcha score too low' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    if (verify.action && verify.action !== action) {
      console.warn('[api/lead] Action mismatch', { expected: action, got: verify.action })
      return new Response(JSON.stringify({ error: 'Captcha action mismatch' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Insert into Supabase (server-side). Prefer service role key, fallback to anon if needed.
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !serviceKey) {
      console.error('[api/lead] Missing Supabase envs')
      return new Response(JSON.stringify({ error: 'Server not configured for persistence' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const serverClient = createClient(supabaseUrl, serviceKey)

    // optional duplicate check
    const { data: existing, error: checkError } = await serverClient
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (checkError) {
      console.error('[api/lead] duplicate check error:', checkError)
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ ok: true, message: 'Already registered' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    const { error: insertError } = await serverClient
      .from('waitlist')
      .insert([{ email, created_at: new Date().toISOString() }])

    if (insertError) {
      console.error('[api/lead] insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to save lead' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ ok: true, message: 'Thanks — we will connect you with an agent shortly.' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[api/lead] unexpected error', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
