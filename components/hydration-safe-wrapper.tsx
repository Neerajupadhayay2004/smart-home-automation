"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface HydrationSafeWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function HydrationSafeWrapper({ children, fallback }: HydrationSafeWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return fallback || null
  }

  return <>{children}</>
}
