'use client'

import React, { useState } from 'react';

const MarketSnapshot = () => {
  const [query, setQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponseText('');
    setError(null);

    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), model: 'gpt-5-mini' }),
      });

      const txt = await res.text();
      let data: any = txt;
      try { data = JSON.parse(txt); } catch {}

      if (!res.ok) {
        console.error('[MarketSnapshot] server error', res.status, data);
        const serverMsg = (data && (data.error || data.message)) ? JSON.stringify(data) : txt;
        setError(`Server returned ${res.status}: ${serverMsg}`);
        return;
      }

      const answer = data?.answer ??
                     data?.raw?.output_text ??
                     (Array.isArray(data?.raw?.output) ? data.raw.output.map((o:any)=> (o?.content||[]).map((c:any)=>c?.text||'').join('')).join('\n') : undefined) ??
                     data?.raw?.choices?.[0]?.message?.content ??
                     data?.choices?.[0]?.message?.content ??
                     data?.choices?.[0]?.text ??
                     (typeof data === 'string' ? data : JSON.stringify(data));

      setResponseText(String(answer).trim() || 'No answer returned. Check server logs.');
    } catch (err) {
      console.error('[MarketSnapshot] fetch failed', err);
      setError('Error fetching data. Check server logs or network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mb-20">
      <h3 className="text-xl font-semibold mb-2">Market Snapshot (demo)</h3>
      <div className="flex gap-2 mb-2">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} className="flex-1 px-3 py-2 rounded bg-white text-black" placeholder="Ask: What's the market trend in Miami this month?" />
        <button onClick={handleAsk} className="px-4 py-2 bg-white text-black rounded" disabled={loading}>{loading ? 'Thinking...' : 'Ask'}</button>
      </div>

      {error && <div className="mt-2 p-3 bg-red-800/30 text-red-200 rounded whitespace-pre-wrap">{error}</div>}
      {responseText && <div className="mt-2 p-3 bg-white/5 rounded whitespace-pre-wrap">{responseText}</div>}
    </section>
  );
};

export default MarketSnapshot;