"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Clock, Coffee, Brain, AlertTriangle } from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: TimerSettings
  onSettingsChange: (settings: TimerSettings) => void
}

export interface TimerSettings {
  workDuration: number // in minutes
  shortBreakDuration: number // in minutes
  longBreakDuration: number // in minutes
  longBreakInterval: number // every N sessions
  fatigueDetection: {
    enabled: boolean
    sensitivityLevel: 'low' | 'medium' | 'high'
    drowsyThreshold: number // seconds of drowsiness before suggesting break
    autoBreak: boolean // automatically trigger break when very drowsy
  }
}

export const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  fatigueDetection: {
    enabled: true,
    sensitivityLevel: 'medium',
    drowsyThreshold: 30,
    autoBreak: false
  }
}

export function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<TimerSettings>(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    onSettingsChange(localSettings)
    onClose()
  }

  const handleReset = () => {
    setLocalSettings(defaultSettings)
  }

  const getSensitivityDescription = (level: string) => {
    switch (level) {
      case 'low': return 'Less sensitive - requires more obvious signs of fatigue'
      case 'medium': return 'Balanced - detects moderate signs of fatigue'
      case 'high': return 'Highly sensitive - detects early signs of fatigue'
      default: return ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - reduced transparency */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Ultra Compact Modal */}
      <div className="relative w-80 backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 rounded-xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-xs font-medium text-slate-800 dark:text-slate-100">Settings</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="w-5 h-5 p-0 rounded-full">
            <X className="w-2.5 h-2.5" />
          </Button>
        </div>

        <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
          {/* Timer Settings */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              Timer
            </h3>
            
            {/* Horizontal Timer Settings */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* Work Duration */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-700 dark:text-slate-300 block text-center whitespace-nowrap">Work Duration</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={localSettings.workDuration}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      workDuration: parseInt(e.target.value) || 25
                    }))}
                    className="w-11 px-1 py-0.5 text-[10px] text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-slate-500">m</span>
                </div>
              </div>

              {/* Short Break */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-700 dark:text-slate-300 block text-center whitespace-nowrap">Short Break</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={localSettings.shortBreakDuration}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      shortBreakDuration: parseInt(e.target.value) || 5
                    }))}
                    className="w-11 px-1 py-0.5 text-[10px] text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-slate-500">m</span>
                </div>
              </div>

              {/* Long Break */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-700 dark:text-slate-300 block text-center whitespace-nowrap">Long Break</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={localSettings.longBreakDuration}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      longBreakDuration: parseInt(e.target.value) || 15
                    }))}
                    className="w-11 px-1 py-0.5 text-[10px] text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-slate-500">m</span>
                </div>
              </div>

              {/* Long Break Interval */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-700 dark:text-slate-300 block text-center whitespace-nowrap">Break Every</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={localSettings.longBreakInterval}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      longBreakInterval: parseInt(e.target.value) || 4
                    }))}
                    className="w-11 px-1 py-0.5 text-[10px] text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-slate-500">sessions</span>
                </div>
              </div>
            </div>

          </div>

          {/* Fatigue Detection */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Brain className="w-2.5 h-2.5" />
              Fatigue Detection
            </h3>

            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300">Enable</span>
              <button
                onClick={() => setLocalSettings(prev => ({
                  ...prev,
                  fatigueDetection: {
                    ...prev.fatigueDetection,
                    enabled: !prev.fatigueDetection.enabled
                  }
                }))}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  localSettings.fatigueDetection.enabled
                    ? 'bg-blue-600'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                    localSettings.fatigueDetection.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {localSettings.fatigueDetection.enabled && (
              <>
                {/* Sensitivity */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300">Sensitivity</span>
                  <select
                    value={localSettings.fatigueDetection.sensitivityLevel}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      fatigueDetection: {
                        ...prev.fatigueDetection,
                        sensitivityLevel: e.target.value as 'low' | 'medium' | 'high'
                      }
                    }))}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Threshold */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-700 dark:text-slate-300">Break After</span>
                    <span className="text-[10px] text-slate-500">{localSettings.fatigueDetection.drowsyThreshold}s</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={localSettings.fatigueDetection.drowsyThreshold}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      fatigueDetection: {
                        ...prev.fatigueDetection,
                        drowsyThreshold: parseInt(e.target.value)
                      }
                    }))}
                    className="w-full h-0.5 accent-blue-600"
                  />
                </div>

                {/* Auto Break */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300">Auto Break</span>
                  <button
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      fatigueDetection: {
                        ...prev.fatigueDetection,
                        autoBreak: !prev.fatigueDetection.autoBreak
                      }
                    }))}
                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                      localSettings.fatigueDetection.autoBreak
                        ? 'bg-blue-600'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                        localSettings.fatigueDetection.autoBreak ? 'translate-x-3.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-1.5 p-2 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
          <Button onClick={handleReset} variant="outline" size="sm" className="flex-1 text-[10px] h-6">
            Reset
          </Button>
          <Button onClick={handleSave} size="sm" className="flex-1 text-[10px] h-6 bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
        </div>
      </div>
    </div>
  )
} 