"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Brain, Timer, Coffee, Activity, X } from "lucide-react"

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [step, setStep] = useState<'how-it-works' | 'features'>('how-it-works')
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-[360px] backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 rounded-xl border border-white/20 dark:border-slate-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex-1 text-center">
            <h2 className="text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to Breakpoint
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Your intelligent productivity companion
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="w-6 h-6 p-0 rounded-full ml-2">
            <X className="w-3 h-3" />
          </Button>
        </div>

        <div className="p-4">
          {step === 'how-it-works' ? (
            <div className="space-y-4">
              {/* How it works */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-slate-900 dark:text-slate-100">How it works</h3>
                <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 space-y-2">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-700/50">
                    <div className="p-1.5 mt-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 shrink-0">
                      <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Pomodoro Timer</p>
                      <p>Work in focused sessions (default 25 mins), followed by short breaks (5 mins). After 4 sessions, take a longer break to recharge.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-700/50">
                    <div className="p-1.5 mt-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 shrink-0">
                      <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">AI-Powered Monitoring</p>
                      <p>Our AI monitors your fatigue levels in real-time and suggests breaks when needed, helping you maintain optimal focus and productivity.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <Button 
                onClick={() => setStep('features')} 
                size="sm"
                className="w-full mt-3 rounded-full h-9 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200"
              >
                Next
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Features */}
              <div className="grid gap-2">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-700/50">
                  <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50">
                    <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-medium text-slate-900 dark:text-slate-100">Smart Timer</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Customizable work sessions and breaks
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-700/50">
                  <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/50">
                    <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-medium text-slate-900 dark:text-slate-100">Fatigue Detection</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      AI-powered drowsiness monitoring
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-700/50">
                  <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/50">
                    <Coffee className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-medium text-slate-900 dark:text-slate-100">Smart Breaks</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Perfectly timed break reminders
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-700/50">
                  <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/50">
                    <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-medium text-slate-900 dark:text-slate-100">Progress Tracking</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Monitor your productivity patterns
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Button Group */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setStep('how-it-works')} 
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-full h-9 text-sm"
                >
                  Back
                </Button>
                <Button 
                  onClick={onClose} 
                  size="sm"
                  className="flex-1 rounded-full h-9 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}