"use client"

import { useState, useEffect } from "react"
import { WebcamPreview } from "@/components/webcam-preview"
import { BreakModal } from "@/components/break-modal"
import { TitleBar } from "@/components/title-bar"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

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
    <div className="min-h-screen bg-white dark:bg-slate-800 flex items-center justify-center pt-8 transition-colors duration-300">
      <TitleBar />
      
      {/* Main Card - Now fills the window */}
      <div className="w-full h-full flex flex-col">
        {/* Main Content */}
        <div className="flex-1 scale-padding space-y-8 flex flex-col justify-center">
          {/* Timer and Webcam Row */}
          <div className="flex items-center scale-gap">
            {/* Main Timer Display */}
            <div className="flex-1 text-center scale-space-y">
              <div className="scale-space-y">
                <div className="scale-text font-extralight text-slate-800 dark:text-slate-100 tabular-nums tracking-tight">
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex items-center justify-center scale-gap scale-text-sm text-slate-500 dark:text-slate-400">
                  <span>Session {sessionCount + 1}</span>
                  <span>•</span>
                  <span>{sessionCount} completed today</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center scale-gap">
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </Button>
                <Button
                  onClick={isRunning ? handlePause : handleStart}
                  className="rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {isRunning ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white ml-1" />}
                </Button>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> {/* Spacer for symmetry */}
              </div>
            </div>

            {/* Compact Webcam */}
            <div className="flex-shrink-0">
              <WebcamPreview />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center scale-gap py-2 px-4 rounded-xl bg-slate-50/30 dark:bg-slate-800/20 border border-slate-200/20 dark:border-slate-700/20">
            <div className="text-center">
              <div className="scale-text-sm font-medium text-slate-600 dark:text-slate-300">{sessionCount}</div>
              <div className="scale-text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Sessions</div>
            </div>
            <div className="text-center">
              <div className="scale-text-sm font-medium text-slate-600 dark:text-slate-300">
                {Math.floor((sessionCount * 25) / 60)}h {(sessionCount * 25) % 60}m
              </div>
              <div className="scale-text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Focus Time</div>
            </div>
            <div className="text-center">
              <div className="scale-text-sm font-medium text-slate-600 dark:text-slate-300">
                {Math.floor(sessionCount / 4)}
              </div>
              <div className="scale-text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Cycles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Break Modal */}
      <BreakModal isOpen={showBreakModal} onClose={handleBreakComplete} sessionCount={sessionCount} />
    </div>
  )
}
