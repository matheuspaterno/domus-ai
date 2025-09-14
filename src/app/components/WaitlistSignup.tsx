"use client"

import { useState } from 'react'

declare global {
  interface Window { grecaptcha?: any }
}

export default function WaitlistSignup() {
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('') // honeypot
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccess('')

    const cleanEmail = email.trim().toLowerCase()
    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      // Get reCAPTCHA v3 token with robust readiness check
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string
      if (!siteKey) throw new Error('Missing reCAPTCHA site key')

      // wait up to ~5s for grecaptcha to be injected
      const waitForGrecaptcha = async (maxMs = 5000, interval = 100): Promise<typeof window.grecaptcha> => {
        const start = Date.now()
        while (Date.now() - start < maxMs) {
          if (window.grecaptcha && typeof window.grecaptcha.execute === 'function') return window.grecaptcha
          await new Promise(r => setTimeout(r, interval))
        }
        throw new Error('Captcha not ready')
      }

      const grecaptcha = await waitForGrecaptcha()
      const token = await grecaptcha.execute(siteKey, { action: 'contact_form' })

      // Send to server for verification and persistence
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, token, action: 'contact_form', website: hp }),
      })

  const payload = await res.json().catch(() => ({} as any))
      if (!res.ok || payload?.error) {
        const extra = payload?.details ? ` (${JSON.stringify(payload.details)})` : ''
        throw new Error((payload?.error || `Server responded ${res.status}`) + extra)
      }

      setSuccess(payload?.message || 'Thanks — we will connect you with an agent shortly.')
      setEmail('')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Waitlist submission error:', message)
      setErrorMsg(message || 'Verification failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 w-full mt-6" autoComplete="off">
      {/* Honeypot field (hidden from users) */}
      <div style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e)=>setHp(e.target.value)} />
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 px-4 py-3 rounded text-white bg-white/3 placeholder-gray-300 w-full"
        placeholder="Enter your email"
      />

      <button
        type="submit"
        disabled={submitting}
  className="btn-primary w-full sm:w-48 hover:cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? 'Sending...' : 'Contact an Agent'}
      </button>

      {success && <p className="text-green-400 mt-3 sm:mt-0 sm:ml-4">{success}</p>}
      {errorMsg && <p className="text-red-400 mt-3 sm:mt-0 sm:ml-4">{errorMsg}</p>}
    </form>
  )
}
