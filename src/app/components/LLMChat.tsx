'use client'

import { useState } from 'react'

export default function LLMChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const MAX_MSGS = 8

  async function sendMessage() {
    if (!input.trim()) return
    // Client-side interaction limit safeguard
    const userTurns = messages.filter(m => m.role === 'user').length
    if (userTurns >= MAX_MSGS) {
      setError('You have reached the limit of messages in this interaction (we are in beta). Please wait 24 hours or reach us in the "Contact a Real Estate Agent" form for more information.')
      return
    }
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

      let finalReply = String(reply).trim() || 'No answer returned. Check server logs.'

      // If the model didn’t include a CTA and it makes sense to suggest once, add a soft suggestion
      const alreadySuggested = messages.some(m => m.role === 'assistant' && m.text.toLowerCase().includes('contact a real estate agent'))
      const looksRelevant = /buy|sell|invest|mortgage|pre-approval|list|offer|closing|agent|realtor|property|home/i.test(userText)
      if (!alreadySuggested && looksRelevant) {
        finalReply += `\n\nIf you’d like tailored help, you can use the "Contact a Real Estate Agent" form below — we’ll email you for preferences and match you with a local agent.`
      }

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