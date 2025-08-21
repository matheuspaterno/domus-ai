'use client'

import React, { useState } from 'react';

const Glossary = () => {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term) return;
    setLoading(true);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term }),
      });
      const data = await response.json();
      setDefinition(data?.answer ?? 'No definition returned.');
    } catch (err) {
      console.error(err);
      setDefinition('Error fetching definition.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mb-20">
      <h2 className="text-3xl font-semibold mb-4">AI Glossary / Explainer</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input value={term} onChange={handleInputChange} className="flex-1 px-3 py-2 rounded bg-white text-black" placeholder="Enter term (e.g., lien)" />
        <button type="submit" className="px-4 py-2 bg-white text-black rounded" disabled={loading}>{loading ? 'Thinking...' : 'Explain'}</button>
      </form>
      {definition && <div className="mt-4 p-3 bg-white/5 rounded">{definition}</div>}
    </section>
  );
};

export default Glossary;