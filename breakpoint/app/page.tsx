"use client"

import { useState, useEffect } from "react"
import { WebcamPreview } from "@/components/webcam-preview"
import { BreakModal } from "@/components/break-modal"
import { TitleBar } from "@/components/title-bar"
import { SettingsModal, TimerSettings, defaultSettings } from "@/components/settings-modal"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Coffee } from "lucide-react"

declare global {
  interface Window {
    electronAPI: {
      toggleMiniMode: (isMinimized: boolean) => void
      restoreFromMini: () => void
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
  const [lastStatusChange, setLastStatusChange] = useState(Date.now())

  // Listen for status updates from the fatigue detector
  useEffect(() => {
    console.log('📡 [PAGE] Status listener useEffect triggered - isMinimized:', isMinimized)
    
    if (isMinimized && window.drowsiness && window.drowsiness.onMiniStatusUpdate) {
      console.log('📡 [PAGE] Setting up status listener for border colors')
      window.drowsiness.onMiniStatusUpdate((status: string) => {
        console.log('📥 [PAGE] Received status for border:', status)
        setCurrentStatus(status)
        handleFatigueStatusUpdate(status as "alert" | "drowsy")
      })
    } else {
      console.log('⏸️ [PAGE] Not setting up status listener - isMinimized:', isMinimized)
    }
  }, [isMinimized]) // Change dependency to isMinimized

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

    const now = Date.now()
    if (status !== fatigueStatus) {
      setFatigueStatus(status)
      setLastStatusChange(now)
      
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
            console.log('🚨 [FATIGUE] Drowsiness threshold reached, suggesting break')
            
            if (settings.fatigueDetection.autoBreak) {
              // Automatically trigger break
              setIsRunning(false)
              setShowBreakModal(true)
              setDrowsyDuration(0)
            } else {
              // Show notification or visual indicator (could add toast here)
              console.log('💡 [FATIGUE] Consider taking a break - drowsy for', newDuration, 'seconds')
            }
          }
          
          return newDuration
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [fatigueStatus, isRunning, settings.fatigueDetection])

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
    
    // If drowsy and sensitivity is high, time moves faster (suggests break sooner)
    if (multiplier > 1 && fatigueStatus === "drowsy") {
      console.log('⚡ [FATIGUE] Accelerating timer due to drowsiness (multiplier:', multiplier, ')')
    }
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
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeRemaining, settings.workDuration, settings.longBreakInterval])

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

  // Load settings from localStorage on mount
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




  const handleMinimize = () => {
    const newMinimizedState = !isMinimized
    console.log('🔄 [PAGE] Minimize button clicked, changing from', isMinimized, 'to', newMinimizedState)
    setIsMinimized(newMinimizedState)
    if (window.electronAPI) {
      console.log('📤 [PAGE] Sending toggle-mini-mode to electron')
      window.electronAPI.toggleMiniMode(newMinimizedState)
    } else {
      console.warn('⚠️ [PAGE] window.electronAPI not available')
    }
  }

  const handleRestoreFromMini = () => {
    console.log('🔄 [PAGE] Restore from mini clicked')
    setIsMinimized(false)
    if (window.electronAPI) {
      window.electronAPI.restoreFromMini()
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
        <div className={`w-48 h-64 flex flex-col items-center justify-between p-4 glass--effect rounded-xl border-2 transition-all duration-500 ${getBorderColor(currentStatus)} relative`}>
          {/* Timer and Status */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3 pt-3">
              <div className="text-center">
                {/* <div className="text-lg font-extralight text-slate-800 dark:text-slate-100 tabular-nums tracking-tight"> */}
                  {formatTime(timeRemaining)}
                {/* </div> */}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isRunning ? "Focus" : "Paused"}
                </div>
              </div>
              <div className="text-lg">{getEmoticon()}</div>
            </div>
            
            {/* Camera Preview */}
            <div className="flex-shrink-0 scale-80 transform">
              <WebcamPreview onFatigueChange={handleFatigueStatusUpdate} />
            </div>
          </div>
          
          {/* Restore overlay - exclude camera area */}
          <button
            onClick={handleRestoreFromMini}
            className="absolute top-0 left-0 right-0 h-20 cursor-pointer opacity-0 hover:opacity-100 bg-black/5 dark:bg-white/5 transition-opacity duration-200 rounded-t-xl"
            title="Click here to restore window"
          />
          {/* <button
            onClick={handleRestoreFromMini}
            className="absolute bottom-20 left-0 right-0 h-8 cursor-pointer opacity-0 hover:opacity-100 bg-black/5 dark:bg-white/5 transition-opacity duration-200"
            title="Click here to restore window"
          /> */}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen glass--effect flex items-center justify-center pt-16 transition-colors duration-300">
      <TitleBar onMinimize={handleMinimize} isMinimized={isMinimized} onOpenSettings={handleOpenSettings} />
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
    </div>
  )
}
