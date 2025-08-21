'use client'

import { useState } from 'react'

export default function LLMChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendMessage() {
    if (!input.trim()) return
    const userText = input.trim()
    setMessages((m) => [...m, { role: 'user', text: userText }])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, model: 'gpt-5-mini' }),
      })

      if (!res.ok) {
        const txt = await res.text()
        // try to surface structured server error if present
        let parsed: any = txt
        try { parsed = JSON.parse(txt) } catch {}
        throw new Error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed))
      }

      const data = await res.json()

      // safer reply extraction with nullish coalescing and fallbacks
      const responsesArrayToText = (arr: any[]) =>
        arr
          .map((o: any) => (o?.content || []).map((c: any) => c?.text || '').join(''))
          .filter(Boolean)
          .join('\n')

      const reply =
        data?.answer ??
        data?.raw?.output_text ??
        (Array.isArray(data?.raw?.output) ? responsesArrayToText(data.raw.output) : undefined) ??
        data?.raw?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text ??
        ''

      const finalReply = String(reply).trim() || 'No answer returned. Check server logs.'

      setMessages((m) => [...m, { role: 'assistant', text: finalReply }])
    } catch (err) {
      console.error(err)
      setError('Failed to get a reply. Check server logs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-gray-900/50 p-4 rounded-md text-left">
      <div className="mb-3">
        <h3 className="text-xl font-semibold">Ask Domus AI</h3>
        <p className="text-sm text-gray-300">Property research, liens, market snapshot — try questions like “What is a lien?”</p>
      </div>

      <div className="space-y-3 max-h-64 overflow-auto mb-3">
        {messages.length === 0 && <p className="text-gray-400">No conversation yet — ask something.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded ${m.role === 'user' ? 'bg-white/10 text-white ml-auto max-w-[80%]' : 'bg-white/5 text-gray-100 max-w-[80%]'}`}>
            <div className="text-sm">{m.text}</div>
            <div className="text-xs text-gray-400 mt-1">{m.role}</div>
          </div>
        ))}
      </div>

      {error && <div className="text-sm text-red-400 mb-2">{error}</div>}

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded bg-white text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about property research, liens, market trends..."
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
        />
        <button
          className="px-4 py-2 bg-white text-black rounded disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  )
}