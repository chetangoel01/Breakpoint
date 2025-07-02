"use client"

interface TimerBarProps {
  progress: number
  isRunning: boolean
}

export function TimerBar({ progress, isRunning }: TimerBarProps) {
  return (
    <div className="w-full scale-space-y">
      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out ${
            isRunning ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-gradient-to-r from-slate-400 to-slate-500"
          }`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />

        {/* Animated glow effect when running */}
        {isRunning && (
          <div
            className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
            style={{
              left: `${Math.max(0, Math.min(92, progress - 4))}%`,
              transition: "left 1s ease-out",
            }}
          />
        )}
      </div>

      <div className="flex justify-between scale-text-xs text-slate-500 dark:text-slate-400">
        <span>0:00</span>
        <span className={isRunning ? "text-blue-600 dark:text-blue-400" : ""}>
          {isRunning ? "Focus Time" : "Paused"}
        </span>
        <span>25:00</span>
      </div>
    </div>
  )
}
