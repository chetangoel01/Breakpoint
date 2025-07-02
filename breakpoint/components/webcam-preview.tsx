"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff } from "lucide-react"

export function WebcamPreview() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsEnabled(true)
        setError(null)
      }
    } catch (err) {
      setError("Camera unavailable")
      console.error("Error accessing webcam:", err)
    }
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsEnabled(false)
  }

  useEffect(() => {
    return () => {
      stopWebcam()
    }
  }, [])

  return (
    <div className="relative">
      {/* Compact Camera Preview */}
      <div className="w-32 h-24 sm:w-40 sm:h-30 md:w-48 md:h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200/50 dark:border-slate-600/50">
        {isEnabled ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            {error ? (
              <div className="text-center p-2">
                <CameraOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
              </div>
            ) : (
              <div className="text-center p-2">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Camera off</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Camera Toggle */}
      <Button
        onClick={isEnabled ? stopWebcam : startWebcam}
        size="icon"
        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 shadow-lg border border-slate-200/50 dark:border-slate-600/50"
      >
        {isEnabled ? <CameraOff className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /> : <Camera className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />}
      </Button>
    </div>
  )
}
