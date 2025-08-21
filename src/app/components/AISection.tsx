'use client'

import LLMChat from './LLMChat'
import MarketSnapshot from './MarketSnapshot'
import PropertyAnalyzer from './PropertyAnalyzer'
import Glossary from './Glossary'

export default function AISection() {
  return (
    <section className="max-w-full mb-12 w-full bg-white/3 backdrop-blur-md border border-white/6 rounded-xl p-10 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-white">Interact with Domus AI</h2>

      {/* center the tools and limit their width for consistency with About section */}
      <div className="w-full max-w-3xl space-y-8">
        <LLMChat />
        <MarketSnapshot />
        <PropertyAnalyzer />
        <Glossary />
      </div>
    </section>
  )
}