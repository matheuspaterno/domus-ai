'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function WaitlistSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(false)
    setErrorMsg('')

    const cleanEmail = email.trim().toLowerCase()

    // Basic frontend email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    try {
      // Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from('waitlist')
        .select('id')
        .eq('email', cleanEmail)
        .limit(1)

      if (checkError) throw checkError

      if (existing && existing.length > 0) {
        setErrorMsg('This email is already on the waitlist.')
        return
      }

      // Insert new email
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([{ email: cleanEmail }])

      if (insertError) throw insertError

      setSubmitted(true)
      setEmail('') // Clear input

    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      console.error('Supabase error:', error)
      setErrorMsg('Something went wrong. Please try again later.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mt-8">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="px-4 py-2 rounded text-black bg-white placeholder-gray-500 w-full sm:w-auto"
        placeholder="Enter your email"
      />

      <button
        type="submit"
        className="bg-white text-black p-2 rounded w-full sm:w-auto 
               cursor-pointer transition duration-200 
               hover:bg-gray-200 active:bg-gray-300"
      >
        Join Waitlist
      </button>

      {submitted && <p className="text-green-500 mt-2 sm:mt-0 sm:ml-4">Thanks for signing up!</p>}
      {errorMsg && <p className="text-red-500 mt-2 sm:mt-0 sm:ml-4">{errorMsg}</p>}
    </form>
  )
}
