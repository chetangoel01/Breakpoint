"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Coffee, StretchVerticalIcon as Stretch, Eye, X } from "lucide-react"

interface BreakModalProps {
  isOpen: boolean
  onClose: () => void
  sessionCount: number
  shortBreakDuration?: number
  longBreakDuration?: number
  longBreakInterval?: number
}

export function BreakModal({ 
  isOpen, 
  onClose, 
  sessionCount, 
  shortBreakDuration = 5,
  longBreakDuration = 15,
  longBreakInterval = 4
}: BreakModalProps) {
  const [breakTime, setBreakTime] = useState(shortBreakDuration * 60)
  const [isBreakRunning, setIsBreakRunning] = useState(false)

  const isLongBreak = sessionCount % longBreakInterval === 0 && sessionCount > 0

  useEffect(() => {
    if (isOpen) {
      setBreakTime(isLongBreak ? longBreakDuration * 60 : shortBreakDuration * 60)
      setIsBreakRunning(true)
    }
  }, [isOpen, isLongBreak, shortBreakDuration, longBreakDuration])

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
      <div className="relative w-full max-w-sm backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 rounded-2xl p-5 border border-white/20 dark:border-slate-700/50 shadow-2xl">
        <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-3 right-3 h-6 w-6 rounded-full">
          <X className="w-3 h-3" />
        </Button>

        <div className="text-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100">
              {isLongBreak ? "Long Break Time!" : "Break Time!"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Great work! Time for a {isLongBreak ? longBreakDuration : shortBreakDuration} minute break.
            </p>
          </div>

          {/* Break Timer */}
          <div className="space-y-3">
            <div className="text-3xl font-light text-slate-800 dark:text-slate-100 tabular-nums">
              {formatTime(breakTime)}
            </div>

            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                style={{
                  width: `${100 - (breakTime / (isLongBreak ? longBreakDuration * 60 : shortBreakDuration * 60)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Break Activities */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-slate-600 dark:text-slate-300">Suggested Activities</h3>
            <div className="grid gap-1.5">
              {breakActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-100/50 dark:bg-slate-700/50"
                >
                  <activity.icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <div className="text-left">
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-100">{activity.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{activity.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsBreakRunning(!isBreakRunning)}
              variant="outline"
              size="sm"
              className="flex-1 rounded-full h-8 text-xs"
            >
              {isBreakRunning ? "Pause" : "Resume"}
            </Button>
            <Button
              onClick={onClose}
              size="sm"
              className="flex-1 rounded-full h-8 text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Skip Break
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
