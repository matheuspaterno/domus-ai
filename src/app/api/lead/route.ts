import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

type RecaptchaResponse = {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

// simple in-memory rate limiting store (resets on server restart)
const ipBuckets = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS = 60_000 // 1 minute window
const MAX_PER_WINDOW = 10 // max requests per IP per window
const EMAIL_COOLDOWN_MS = 60_000 // per-email cooldown
const emailCooldown = new Map<string, number>()

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()
    const token = String(body?.token || '')
    const action = String(body?.action || 'contact_form')
    const honeypot = String(body?.website || body?.hp || body?.company || '') // accept multiple names

    // Honeypot check: if bot fills hidden field, reject
    if (honeypot) {
      return new Response(JSON.stringify({ error: 'Spam detected' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Basic IP extraction
    const ip = (req as any).headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() || (req as any).headers?.get?.('x-real-ip') || ''
    const now = Date.now()
    if (ip) {
      const bucket = ipBuckets.get(ip)
      if (!bucket || now - bucket.windowStart > WINDOW_MS) {
        ipBuckets.set(ip, { count: 1, windowStart: now })
      } else {
        bucket.count += 1
        if (bucket.count > MAX_PER_WINDOW) {
          return new Response(JSON.stringify({ error: 'Too many requests, please slow down.' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
        }
      }
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Per-email cooldown
    const until = emailCooldown.get(email)
    if (until && now < until) {
      const secs = Math.ceil((until - now) / 1000)
      return new Response(JSON.stringify({ error: `Please wait ${secs}s before retrying.` }), { status: 429, headers: { 'Content-Type': 'application/json' } })
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

  // set per-email cooldown
  emailCooldown.set(email, Date.now() + EMAIL_COOLDOWN_MS)

    // Send confirmation email (best-effort)
    try {
      const host = process.env.SMTP_HOST!
      const port = Number(process.env.SMTP_PORT || 465)
      const secure = String(process.env.SMTP_SECURE || 'true') === 'true'
      const user = process.env.SMTP_USER!
      const pass = process.env.SMTP_PASS!
      const from = process.env.SMTP_FROM || `Domus AI <${user}>`

      if (host && user && pass) {
        const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
        const subject = 'Tell us your home preferences'
        const text = `Hey!\nThank you for reaching out to Domus AI. To help us better understand your needs and match you with the right opportunities, we’d love a bit more detail about what you’re looking for in your next home.\nPlease take a moment to reply to this email with your preferences:\nMotivation – What’s driving your decision to purchase right now?\nTimeline – When would you ideally like to move in?\nLocation – If you don’t have an exact area in mind, tell us about the amenities, commute times, or school districts that matter most.\nPrice Range – Think in terms of your ideal monthly payment.\nBeds / Baths – Minimums you’d like to have.\nSquare Foot Range – What size feels comfortable for you?\nName:\nPhone:\nOnce we have this information, our AI will process your preferences and connect you with the realtor best suited to your needs. That agent will then provide tailored listings and personalized guidance aligned with your goals.\nLooking forward to helping you with the next step,\nBest regards,\nDomus AI`
        await transporter.sendMail({ from, to: email, subject, text })
      } else {
        console.warn('[api/lead] SMTP envs missing; skipping email send')
      }
    } catch (mailErr) {
      console.error('[api/lead] email send failed:', mailErr)
    }

    return new Response(JSON.stringify({ ok: true, message: 'Thanks — we will connect you with an agent shortly.' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[api/lead] unexpected error', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
