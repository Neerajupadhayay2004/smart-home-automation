"use client"

import { useState, useEffect } from "react"

export default function ClientClock() {
  const [time, setTime] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="text-right">
        <div className="text-2xl lg:text-3xl font-mono font-bold text-cyan-300">--:--:-- --</div>
        <div className="text-sm lg:text-base text-cyan-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="text-right">
      <div className="text-2xl lg:text-3xl font-mono font-bold text-cyan-300">{time}</div>
      <div className="text-sm lg:text-base text-cyan-400">System Time</div>
    </div>
  )
}
