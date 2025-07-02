"use client"

import { useState, useEffect } from "react"
import { WebcamPreview } from "@/components/webcam-preview"
import { TimerBar } from "@/components/timer-bar"
import { BreakModal } from "@/components/break-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"

export default function FatigueTracker() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(25 * 60) // 25 minutes in seconds
  const [totalTime, setTotalTime] = useState(25 * 60)
  const [showBreakModal, setShowBreakModal] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setShowBreakModal(true)
            setSessionCount((count) => count + 1)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeRemaining])

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setTimeRemaining(totalTime)
  }

  const handleBreakComplete = () => {
    setShowBreakModal(false)
    setTimeRemaining(totalTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6 transition-colors duration-300">
      {/* Single Unified Window */}
      <div className="w-full max-w-2xl backdrop-blur-2xl bg-white/80 dark:bg-slate-800/80 rounded-[2rem] border border-white/30 dark:border-slate-700/50 shadow-2xl overflow-hidden">
        {/* macOS-style Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            {/* macOS Traffic Lights */}
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <h1 className="text-lg font-medium text-slate-800 dark:text-slate-100 ml-4">Focus Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Timer and Webcam Row */}
          <div className="flex items-center gap-8">
            {/* Main Timer Display */}
            <div className="flex-1 text-center space-y-6">
              <div className="space-y-3">
                <div className="text-7xl font-extralight text-slate-800 dark:text-slate-100 tabular-nums tracking-tight">
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span>Session {sessionCount + 1}</span>
                  <span>•</span>
                  <span>{sessionCount} completed today</span>
                </div>
              </div>

              {/* Timer Bar */}
              <TimerBar progress={((totalTime - timeRemaining) / totalTime) * 100} isRunning={isRunning} />

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-12 h-12 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  onClick={isRunning ? handlePause : handleStart}
                  className="rounded-full w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {isRunning ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
                </Button>
                <div className="w-12 h-12" /> {/* Spacer for symmetry */}
              </div>
            </div>

            {/* Compact Webcam */}
            <div className="flex-shrink-0">
              <WebcamPreview />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-12 py-4 px-6 rounded-2xl bg-slate-100/50 dark:bg-slate-700/30">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{sessionCount}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {Math.floor((sessionCount * 25) / 60)}h {(sessionCount * 25) % 60}m
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Focus Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {Math.floor(sessionCount / 4)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cycles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Break Modal */}
      <BreakModal isOpen={showBreakModal} onClose={handleBreakComplete} sessionCount={sessionCount} />
    </div>
  )
}
