'use client'

import LLMChat from './LLMChat'
import MarketSnapshot from './MarketSnapshot'
import PropertyAnalyzer from './PropertyAnalyzer'
import Glossary from './Glossary'

export default function AISection() {
  return (
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
  )
}