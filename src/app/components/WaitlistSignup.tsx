"use client"

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

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
      // avoid duplicates
      const { data: existing, error: checkError } = await supabase.from('waitlist').select('id').eq('email', cleanEmail).limit(1)
      if (checkError) throw checkError
      if (existing && existing.length > 0) {
        setErrorMsg('This email is already registered.')
        return
      }

      const { error } = await supabase.from('waitlist').insert([{ email: cleanEmail, created_at: new Date().toISOString() }])
      if (error) throw error

      setSuccess('Thanks — we will connect you with an agent shortly.')
      setEmail('')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Waitlist insert error:', message)
      setErrorMsg('Something went wrong. Please try again later.')
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
