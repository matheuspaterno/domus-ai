'use client'

import React from 'react'

export default function ExploreButton({
  targetId = 'features',
  className = '',
  children,
}: {
  targetId?: string
  className?: string
  children: React.ReactNode
}) {
  const handleClick = () => {
    const el = document.getElementById(targetId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  )
}