'use client'

import LLMChat from './LLMChat'
import MarketSnapshot from './MarketSnapshot'
import PropertyAnalyzer from './PropertyAnalyzer'
import Glossary from './Glossary'

export default function AISection() {
  return (
  <section className="max-w-full mb-12 w-full glass-card p-10 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-white">Interact with Domus AI</h2>

      {/* center the tools and limit their width for consistency with About section */}
  <div className="w-full max-w-3xl space-y-6">
        <div className="tool-card">
          <LLMChat />
        </div>

        <div className="tool-card">
          <MarketSnapshot />
        </div>

        <div className="tool-card">
          <PropertyAnalyzer />
        </div>

        <div className="tool-card">
          <Glossary />
        </div>
      </div>
    </section>
  )
}