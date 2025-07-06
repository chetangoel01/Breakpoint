"use client"

import { useState, useEffect } from "react"
import { WebcamPreview } from "@/components/webcam-preview"
import { BreakModal } from "@/components/break-modal"
import { TitleBar } from "@/components/title-bar"
import { SettingsModal, TimerSettings, defaultSettings } from "@/components/settings-modal"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Coffee } from "lucide-react"
import { WelcomeModal } from "@/components/welcome-modal"

declare global {
  interface Window {
    electronAPI: {
      toggleMiniMode: (isMinimized: boolean) => Promise<void>
      restoreFromMini: () => Promise<void>
      updateFatigueDetection: (enabled: boolean) => Promise<void>
    }
    drowsiness: {
      predictFromBase64: (base64: string) => Promise<{
        status: string
        confidence: number
      }>
      onMiniStatusUpdate: (callback: (status: string) => void) => void
    }
  }
}

export default function FatigueTracker() {
  // Timer states
  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)
  const [totalTime, setTotalTime] = useState(25 * 60)
  const [sessionCount, setSessionCount] = useState(0)
  
  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  
  // Stats tracking
  const [completedSessions, setCompletedSessions] = useState<Array<{duration: number, breakInterval: number}>>([])
  
  // Modal states
  const [showBreakModal, setShowBreakModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  // UI states
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string>("alert")
  
  // Settings and fatigue tracking
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings)
  const [fatigueStatus, setFatigueStatus] = useState<"alert" | "drowsy">("alert")
  const [drowsyDuration, setDrowsyDuration] = useState(0) // seconds of continuous drowsiness
  // const [lastStatusChange, setLastStatusChange] = useState(Date.now())

  // Check if it's the first visit when the component mounts
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true)
      localStorage.setItem('hasSeenWelcome', 'true')
    }
  }, [])

  // Listen for status updates from the fatigue detector
  useEffect(() => {
    if (isMinimized && window.drowsiness && window.drowsiness.onMiniStatusUpdate) {
      window.drowsiness.onMiniStatusUpdate((status: string) => {
        setCurrentStatus(status)
        handleFatigueStatusUpdate(status as "alert" | "drowsy")
      })
    }
  }, [isMinimized])

  // Initialize timer with settings
  useEffect(() => {
    const newTotalTime = settings.workDuration * 60
    setTotalTime(newTotalTime)
    // Only reset the timer if we're not running AND the work duration has changed
    if (!isRunning && totalTime !== newTotalTime) {
      setTimeRemaining(newTotalTime)
    }
  }, [settings.workDuration, isRunning, totalTime])

  // Handle fatigue status updates
  const handleFatigueStatusUpdate = (status: "alert" | "drowsy") => {
    if (!settings.fatigueDetection.enabled) return

    // const now = Date.now()
    if (status !== fatigueStatus) {
      setFatigueStatus(status)
      // setLastStatusChange(now)
      
      if (status === "alert") {
        setDrowsyDuration(0) // Reset drowsy duration when alert
      }
    }
  }

  // Track drowsiness duration and trigger adaptive breaks
  useEffect(() => {
    if (!settings.fatigueDetection.enabled || !isRunning) return

    const interval = setInterval(() => {
      if (fatigueStatus === "drowsy") {
        setDrowsyDuration(prev => {
          const newDuration = prev + 1
          
          // Check if we should suggest a break
          if (newDuration >= settings.fatigueDetection.drowsyThreshold) {
            if (settings.fatigueDetection.autoBreak) {
              setIsRunning(false)
              setShowBreakModal(true)
              setDrowsyDuration(0)
              // Restore from mini mode if needed
              if (isMinimized) {
                handleRestoreFromMini()
              }
            }
          }
          
          return newDuration
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [fatigueStatus, isRunning, settings.fatigueDetection, isMinimized])

  // Adaptive timer adjustments based on fatigue
  useEffect(() => {
    if (!settings.fatigueDetection.enabled || !isRunning) return

    // Adjust timer speed based on sensitivity and fatigue status
    const getSensitivityMultiplier = () => {
      switch (settings.fatigueDetection.sensitivityLevel) {
        case 'high': return fatigueStatus === "drowsy" ? 1.5 : 1
        case 'medium': return fatigueStatus === "drowsy" ? 1.3 : 1
        case 'low': return fatigueStatus === "drowsy" ? 1.1 : 1
        default: return 1
      }
    }

    const multiplier = getSensitivityMultiplier()
  }, [fatigueStatus, settings.fatigueDetection, isRunning])

  const getBorderColor = (status: string): string => {
    switch (status) {
      case "alert":
        return "border-green-500 shadow-green-200 dark:shadow-green-800"
      case "drowsy":
      case "very_drowsy":
        return "border-red-500 shadow-red-200 dark:shadow-red-800"
      case "no_face":
        return "border-yellow-500 shadow-yellow-200 dark:shadow-yellow-800"
      default:
        return "border-gray-500 shadow-gray-200 dark:shadow-gray-800"
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setShowBreakModal(true)
            setSessionCount((count) => count + 1)
            // Record completed session with current settings
            setCompletedSessions(prev => [...prev, {
              duration: settings.workDuration,
              breakInterval: settings.longBreakInterval
            }])
            // Restore from mini mode if needed
            if (isMinimized) {
              handleRestoreFromMini()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeRemaining, settings.workDuration, settings.longBreakInterval, isMinimized])

  // Calculate stats based on completed sessions
  const calculateStats = () => {
    const totalMinutes = completedSessions.reduce((sum, session) => sum + session.duration, 0)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    // Calculate cycles based on break intervals used during those sessions
    let cycleCount = 0
    let sessionsInCurrentCycle = 0
    completedSessions.forEach((session, index) => {
      sessionsInCurrentCycle++
      if (sessionsInCurrentCycle >= session.breakInterval) {
        cycleCount++
        sessionsInCurrentCycle = 0
      }
    })

    return {
      hours,
      minutes,
      cycles: cycleCount
    }
  }

  const stats = calculateStats()

  const handleStart = () => {
    setIsRunning(true)
    setDrowsyDuration(0) // Reset drowsy duration when starting
  }
  
  const handlePause = () => setIsRunning(false)
  
  const handleReset = () => {
    setIsRunning(false)
    setTimeRemaining(totalTime)
    setDrowsyDuration(0)
  }

  const handleBreakComplete = () => {
    setShowBreakModal(false)
    setTimeRemaining(totalTime)
    setDrowsyDuration(0) // Reset fatigue tracking after break
  }

  const handleSettingsChange = (newSettings: TimerSettings) => {
    setSettings(newSettings)
    // Save to localStorage for persistence
    localStorage.setItem('breakpoint-settings', JSON.stringify(newSettings))
  }

  const handleOpenSettings = () => {
    setShowSettingsModal(true)
  }

  const handleOpenHelp = () => {
    setShowWelcomeModal(true)
  }

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('breakpoint-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  // Notify Electron when fatigue detection settings change
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.updateFatigueDetection) {
      window.electronAPI.updateFatigueDetection(settings.fatigueDetection.enabled)
    }
  }, [settings.fatigueDetection.enabled])

  const handleMinimize = async () => {
    const newMinimizedState = !isMinimized
    setIsMinimized(newMinimizedState)
    if (window.electronAPI) {
      await window.electronAPI.toggleMiniMode(newMinimizedState)
    }
  }

  const handleRestoreFromMini = async () => {
    setIsMinimized(false)
    if (window.electronAPI) {
      await window.electronAPI.restoreFromMini()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getEmoticon = () => {
    if (!isRunning) return "😴"
    const progress = ((totalTime - timeRemaining) / totalTime) * 100
    if (progress < 30) return "😊"
    if (progress < 70) return "😐"
    return "😰"
  }

  if (isMinimized) {
    return (
      <div className="min-h-screen glass--effect flex items-center justify-center transition-all duration-300">
        <div className={`w-full h-full flex flex-col items-center justify-between p-2 glass--effect rounded-xl border-2 transition-all duration-500 relative`}>
          {/* Timer and Status */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3 pt-3">
              <div className="text-center">
                {formatTime(timeRemaining)}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isRunning ? "Focus" : "Paused"}
                </div>
              </div>
              {settings.fatigueDetection.enabled && (
                <div className="text-lg">{getEmoticon()}</div>
              )}
            </div>
            
            {/* Camera Preview */}
            <div className="flex-shrink-0 scale-80 transform">
              <WebcamPreview onFatigueChange={handleFatigueStatusUpdate} fatigueDetectionEnabled={settings.fatigueDetection.enabled} />
            </div>
          </div>
          
          {/* Restore overlay - exclude camera area */}
          <button
            onClick={handleRestoreFromMini}
            className="absolute top-0 left-0 right-0 h-20 cursor-pointer opacity-0 hover:opacity-100 bg-black/5 dark:bg-white/5 transition-opacity duration-200 rounded-t-xl"
            title="Click here to restore window"
          />
        </div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen bg-white dark:bg-slate-900 overflow-hidden">
      <TitleBar 
        onMinimize={handleMinimize}
        isMinimized={isMinimized}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenHelp={handleOpenHelp}
      />
      <div className="w-full h-full flex flex-col p-4">
        <div className="flex-1 scale-padding space-y-8 flex flex-col justify-center">
          <div className="flex items-center scale-gap">
            <div className="flex-1 text-center scale-space-y">
              <div className="scale-space-y">
                <div className="scale-text font-extralight tabular-nums tracking-tight">
                    {formatTime(timeRemaining)}
                </div>
                <div className="flex items-center justify-center scale-gap scale-text-sm text-slate-500 dark:text-slate-400">
                  <span>Session {sessionCount + 1}</span>
                  <span>•</span>
                  <span>{sessionCount} completed today</span>
                  {settings.fatigueDetection.enabled && fatigueStatus === "drowsy" && (
                    <>
                      <span>•</span>
                      <span className="text-orange-500 dark:text-orange-400 flex items-center gap-1">
                        😴 Drowsy ({drowsyDuration}s)
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Fatigue Warning */}
              {settings.fatigueDetection.enabled && isRunning && fatigueStatus === "drowsy" && drowsyDuration > settings.fatigueDetection.drowsyThreshold * 0.7 && (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-full border border-orange-200 dark:border-orange-800">
                  <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                    {drowsyDuration >= settings.fatigueDetection.drowsyThreshold 
                      ? "🚨 Break suggested - you've been drowsy for a while"
                      : "⚠️ Consider taking a break soon"
                    }
                  </span>
                </div>
              )}

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
                {settings.fatigueDetection.enabled && fatigueStatus === "drowsy" && drowsyDuration >= settings.fatigueDetection.drowsyThreshold ? (
                  <Button
                    onClick={() => {
                      setIsRunning(false)
                      setShowBreakModal(true)
                    }}
                    variant="outline"
                    className="rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-900/20 transition-all duration-200"
                    title="Take a break (fatigue detected)"
                  >
                    <Coffee className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-600" />
                  </Button>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="glass--effect-light rounded-2xl">
                <WebcamPreview 
                  onFatigueChange={handleFatigueStatusUpdate} 
                  fatigueDetectionEnabled={settings.fatigueDetection.enabled} 
                />
              </div>
            </div>
          </div>
          {/* Stats Bar */}
          <div className="flex items-center justify-center scale-gap py-2 px-4 rounded-2xl">
            <div className="text-center">
              <div className="scale-text-sm font-medium text-slate-600 dark:text-slate-300">{sessionCount}</div>
              <div className="scale-text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Sessions</div>
            </div>
            <div className="text-center">
              <div className="scale-text-sm font-medium text-slate-600 dark:text-slate-300">
                {stats.hours}h {stats.minutes}m
              </div>
              <div className="scale-text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Focus Time</div>
            </div>
            <div className="text-center">
              <div className="scale-text-sm font-medium text-slate-600 dark:text-slate-300">
                {stats.cycles}
              </div>
              <div className="scale-text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Cycles</div>
            </div>
          </div>
        </div>
        <WelcomeModal 
          isOpen={showWelcomeModal} 
          onClose={() => setShowWelcomeModal(false)} 
        />
        <BreakModal 
          isOpen={showBreakModal} 
          onClose={handleBreakComplete} 
          sessionCount={sessionCount}
          shortBreakDuration={settings.shortBreakDuration}
          longBreakDuration={settings.longBreakDuration}
          longBreakInterval={settings.longBreakInterval}
        />
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </main>
  )
}
