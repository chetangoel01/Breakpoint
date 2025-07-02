"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Coffee, StretchVerticalIcon as Stretch, Eye, X } from "lucide-react"

interface BreakModalProps {
  isOpen: boolean
  onClose: () => void
  sessionCount: number
}

export function BreakModal({ isOpen, onClose, sessionCount }: BreakModalProps) {
  const [breakTime, setBreakTime] = useState(5 * 60) // 5 minutes
  const [isBreakRunning, setIsBreakRunning] = useState(false)

  const isLongBreak = sessionCount % 4 === 0 && sessionCount > 0

  useEffect(() => {
    if (isOpen) {
      setBreakTime(isLongBreak ? 15 * 60 : 5 * 60)
      setIsBreakRunning(true)
    }
  }, [isOpen, isLongBreak])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isBreakRunning && breakTime > 0) {
      interval = setInterval(() => {
        setBreakTime((prev) => {
          if (prev <= 1) {
            setIsBreakRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isBreakRunning, breakTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const breakActivities = [
    {
      icon: Coffee,
      title: "Hydrate",
      description: "Drink some water or tea",
    },
    {
      icon: Stretch,
      title: "Stretch",
      description: "Do some light stretching",
    },
    {
      icon: Eye,
      title: "Rest Eyes",
      description: "Look away from the screen",
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 rounded-3xl p-8 border border-white/20 dark:border-slate-700/50 shadow-2xl">
        <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full">
          <X className="w-4 h-4" />
        </Button>

        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {isLongBreak ? "Long Break Time!" : "Break Time!"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Great work! Time for a {isLongBreak ? "15" : "5"} minute break.
            </p>
          </div>

          {/* Break Timer */}
          <div className="space-y-4">
            <div className="text-4xl font-light text-slate-800 dark:text-slate-100 tabular-nums">
              {formatTime(breakTime)}
            </div>

            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                style={{
                  width: `${100 - (breakTime / (isLongBreak ? 15 * 60 : 5 * 60)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Break Activities */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Suggested Activities</h3>
            <div className="grid gap-2">
              {breakActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-700/50"
                >
                  <activity.icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{activity.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{activity.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => setIsBreakRunning(!isBreakRunning)}
              variant="outline"
              className="flex-1 rounded-full"
            >
              {isBreakRunning ? "Pause" : "Resume"}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Skip Break
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
