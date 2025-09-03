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
        // model is enforced server-side to gpt-4; clients should not supply model overrides
        body: JSON.stringify({ message: userText }),
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
  {/* header removed per request */}

      <div className="space-y-3 max-h-64 overflow-auto mb-3 messages">
        {messages.length === 0 && <p className="text-gray-400">No conversation yet — ask something.</p>}
        {messages.map((m, i) => (
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="chat-bubble user">{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="chat-bubble assistant">{m.text}</div>
            </div>
          )
        ))}
      </div>

      {error && <div className="text-sm text-red-400 mb-2">{error}</div>}

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded bg-white text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about property research, liens, market trends (real estate only)..."
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
        />
        <button
          className="btn-send"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  )
}