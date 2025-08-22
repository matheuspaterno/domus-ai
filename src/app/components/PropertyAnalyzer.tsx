'use client'
import React, { useState } from 'react'

export default function PropertyAnalyzer() {
  const [input, setInput] = useState<string>('')
  const [analysis, setAnalysis] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setAnalysis('')

    const trimmed = input.trim()
    if (!trimmed) {
      setError('Please enter a URL or ZIP code.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })

      const text = await res.text()
      let data: any = null
      try { data = JSON.parse(text) } catch { data = text }

      if (!res.ok) {
        console.error('[PropertyAnalyzer] API error', res.status, data)
        const serverMsg = data?.error ?? data ?? `Status ${res.status}`
        setError(`Server error: ${serverMsg}`)
        return
      }

      const answer = data?.answer ?? (typeof data === 'string' ? data : JSON.stringify(data))
      setAnalysis(String(answer))
    } catch (err) {
      console.error('[PropertyAnalyzer] fetch failed', err)
      setError('Failed to analyze the property. Check server logs or network.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-3xl mb-20">
      <h2 className="text-3xl font-semibold mb-4">Smart Property Analyzer</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter property listing URL or ZIP code"
          className="p-2 border border-gray-300 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 border border-red-300 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-end"><div className="chat-bubble user">{input}</div></div>
          <div className="flex justify-start"><div className="chat-bubble assistant">{analysis}</div></div>
        </div>
      )}
    </section>
  )
}