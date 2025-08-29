"use client"

import { useEffect, useRef } from 'react'

export default function Roadmap() {
  const trackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function updateLine() {
      const tr = trackRef.current
      if (!tr) return

      const items = Array.from(tr.querySelectorAll('.roadmap-item')) as HTMLElement[]
      if (!items.length) return

      const trackRect = tr.getBoundingClientRect()
      const firstRect = items[0].getBoundingClientRect()
      const lastRect = items[items.length - 1].getBoundingClientRect()

      const firstCenter = firstRect.top + firstRect.height * 0.5 - trackRect.top
      const lastCenter = lastRect.top + lastRect.height * 0.5 - trackRect.top

      // set CSS variables in px on the track element
      tr.style.setProperty('--line-top', `${firstCenter}px`)
      const bottomOffset = trackRect.height - lastCenter
      tr.style.setProperty('--line-bottom', `${bottomOffset}px`)
    }

    updateLine()
    window.addEventListener('resize', updateLine)
    return () => window.removeEventListener('resize', updateLine)
  }, [])

  return (
    <div className="roadmap">
      <div className="roadmap-track" ref={trackRef}>
        <div className="roadmap-item">
          <div className="roadmap-header">Q4 2025</div>
          <ul className="roadmap-bullets">
            <li>MLS data lookup and title / lien alerts</li>
          </ul>
        </div>

        <div className="roadmap-item">
          <div className="roadmap-header">Q1 2026</div>
          <ul className="roadmap-bullets">
            <li>Investor growth scores based on real-world trends</li>
            <li>AI-powered property research and lead scraping</li>
          </ul>
        </div>

        <div className="roadmap-item">
          <div className="roadmap-header">Q2 2026</div>
          <ul className="roadmap-bullets">
            <li>Tokenized access, real estate NFTs, and clean title verification</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
