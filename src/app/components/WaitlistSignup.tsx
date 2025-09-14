"use client"

import { useState } from 'react'

declare global {
  interface Window { grecaptcha?: any }
}

export default function WaitlistSignup() {
  const [email, setEmail] = useState('')
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
      // Get reCAPTCHA v3 token
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string
      if (!window.grecaptcha || !siteKey) {
        throw new Error('Captcha not ready')
      }

      const token: string = await new Promise((resolve, reject) => {
        try {
          window.grecaptcha.ready(async () => {
            try {
              const t = await window.grecaptcha.execute(siteKey, { action: 'contact_form' })
              resolve(t)
            } catch (e) { reject(e) }
          })
        } catch (e) { reject(e) }
      })

      // Send to server for verification and persistence
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, token, action: 'contact_form' }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok || payload?.error) {
        throw new Error(payload?.error || `Server responded ${res.status}`)
      }

      setSuccess(payload?.message || 'Thanks — we will connect you with an agent shortly.')
      setEmail('')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Waitlist submission error:', message)
  setErrorMsg('Verification failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 w-full mt-6">
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
        className="btn-primary w-full sm:w-48"
      >
        {submitting ? 'Sending...' : 'Contact an Agent'}
      </button>

      {success && <p className="text-green-400 mt-3 sm:mt-0 sm:ml-4">{success}</p>}
      {errorMsg && <p className="text-red-400 mt-3 sm:mt-0 sm:ml-4">{errorMsg}</p>}
    </form>
  )
}
