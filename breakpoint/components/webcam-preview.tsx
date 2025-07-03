"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, Eye, AlertTriangle } from "lucide-react"
import FatigueDetector from "./fatigue-detector"

interface WebcamPreviewProps {
  onFatigueChange?: (status: "alert" | "drowsy") => void
  fatigueDetectionEnabled?: boolean
}

export function WebcamPreview({ onFatigueChange, fatigueDetectionEnabled = true }: WebcamPreviewProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [fatigueStatus, setFatigueStatus] = useState<"alert" | "drowsy">("alert")
  const [lastPredictionTime, setLastPredictionTime] = useState<Date | null>(null)
  const [predictionCount, setPredictionCount] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)

  // Stop webcam when fatigue detection is disabled
  useEffect(() => {
    if (!fatigueDetectionEnabled && isEnabled) {
      stopWebcam()
    }
  }, [fatigueDetectionEnabled])

  const startWebcam = async () => {
    if (!fatigueDetectionEnabled) return

    try {
      setIsInitializing(true)
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsEnabled(true)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access webcam'
      setError(errorMessage)
      console.error('Webcam error:', err)
    } finally {
      setIsInitializing(false)
    }
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsEnabled(false)
    setError(null)
    setFatigueStatus("alert")
    setLastPredictionTime(null)
    setPredictionCount(0)
  }

  const handleFatigueChange = (status: "alert" | "drowsy") => {
    setFatigueStatus(status)
    setLastPredictionTime(new Date())
    setPredictionCount(prev => prev + 1)
    
    // Call parent callback if provided
    onFatigueChange?.(status)
    
    // Log for debugging
    console.log(`🔍 ML Prediction #${predictionCount + 1}:`, status, 'at', new Date().toLocaleTimeString())
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const getStatusColor = () => {
    if (fatigueStatus === "drowsy") {
      return "border-red-500 shadow-red-200 dark:shadow-red-800"
    }
    return "border-green-500 shadow-green-200 dark:shadow-green-800"
  }

  const getStatusIcon = () => {
    if (fatigueStatus === "drowsy") {
      return <AlertTriangle className="h-3 w-3 text-red-500" />
    }
    return <Eye className="h-3 w-3 text-green-500" />
  }

  // If fatigue detection is disabled, don't render anything
  if (!fatigueDetectionEnabled) return null

  return (
    <div className="flex flex-col items-center space-y-2 p-2">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`rounded-lg border-2 object-cover transition-all duration-300 ${
            isEnabled ? getStatusColor() : 'border-gray-300 dark:border-gray-600'
          }`}
          style={{
            width: '160px',
            height: '160px',
            background: isEnabled ? 'transparent' : '#f3f4f6'
          }}
        />
        
        {/* ML Status Indicator */}
        {isEnabled && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 transition-all duration-300 ${
            fatigueStatus === "drowsy" 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
          }`}>
            {getStatusIcon()}
            <span className="capitalize">{fatigueStatus}</span>
          </div>
        )}

        {/* Prediction Counter */}
        {/* {isEnabled && predictionCount > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
            {predictionCount} predictions
          </div>
        )} */}
        
        {/* Stop Button - Only show when camera is enabled */}
        {isEnabled && (
          <Button
            onClick={stopWebcam}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full shadow-lg z-10"
          >
            <CameraOff className="h-3 w-3" />
          </Button>
        )}
        
        {!isEnabled && !isInitializing && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={startWebcam}
          >
            <div className="text-center">
              <Camera className="mx-auto h-6 w-6 text-gray-400 mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Click to start camera</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">ML detection ready</p>
            </div>
          </div>
        )}

        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-1"></div>
              <p className="text-xs text-gray-600 dark:text-gray-300">Starting camera...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Initializing ML model...</p>
            </div>
          </div>
        )}
      </div>

      {/* ML Status Text */}
      {isEnabled && (
        <div className="text-center">
          <div className={`text-xs font-medium ${
            fatigueStatus === "drowsy" 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-green-600 dark:text-green-400'
          }`}>
            {/* {fatigueStatus === "drowsy" ? "⚠️ Drowsiness Detected" : "✅ Alert & Focused"} */}
          </div>
          {/* {lastPredictionTime && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last check: {lastPredictionTime.toLocaleTimeString()}
            </div>
          )} */}
        </div>
      )}

      {error && (
        <div className="text-red-500 text-xs text-center max-w-xs">
          <p>{error}</p>
        </div>
      )}

      {/* FatigueDetector Component - Hidden but processes the video */}
      {isEnabled && videoRef.current && (
        <FatigueDetector 
          frame={videoRef.current} 
          onFatigueChange={handleFatigueChange} 
        />
      )}
    </div>
  )
}
