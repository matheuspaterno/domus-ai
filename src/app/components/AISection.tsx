'use client'

import LLMChat from './LLMChat'

export default function AISection() {
  return (
    <div className="w-full max-w-3xl">
      <div className="tool-card">
        <LLMChat />
      </div>
    </div>
  )
}