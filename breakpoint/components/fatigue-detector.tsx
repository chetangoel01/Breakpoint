// components/FatigueDetector.tsx
"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  frame: HTMLVideoElement | HTMLCanvasElement | ImageBitmap | null
  onFatigueChange: (status: "alert" | "drowsy") => void
}

declare global {
  interface Window {
    drowsiness: {
      predictFromBase64: (base64: string) => Promise<{
        status: string
        confidence: number
      }>
      onMiniStatusUpdate: (callback: (status: string) => void) => void
    }
    electron: {
      ipcRenderer: {
        send: (channel: string, data: any) => void
      }
    }
  }
}

export default function FatigueDetector({ frame, onFatigueChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const aggregationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [predictionHistory, setPredictionHistory] = useState<string[]>([])
  const predictionHistoryRef = useRef<string[]>([]) // Add ref to track current history

  // Debug: Check if window.electron is available
  useEffect(() => {
    console.log('🔧 [FATIGUE-DETECTOR] Component mounted');
    console.log('🔧 [FATIGUE-DETECTOR] window.electron available:', !!window.electron);
    console.log('🔧 [FATIGUE-DETECTOR] window.electron.ipcRenderer available:', !!(window.electron && window.electron.ipcRenderer));
  }, [])

  // Sync ref with state
  useEffect(() => {
    predictionHistoryRef.current = predictionHistory
  }, [predictionHistory])

  useEffect(() => {
    if (!frame) return

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Process frames every 2 seconds to avoid overwhelming the Python process
    intervalRef.current = setInterval(async () => {
      if (isProcessing) return // Skip if already processing
      
      await processFrame(frame)
    }, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [frame, isProcessing])

  // Set up aggregation timer
  useEffect(() => {
    // Clear any existing aggregation interval
    if (aggregationIntervalRef.current) {
      clearInterval(aggregationIntervalRef.current)
    }

    console.log('⏰ [FATIGUE-DETECTOR] Setting up aggregation timer');

    // Compute aggregated status every 5 seconds
    aggregationIntervalRef.current = setInterval(() => {
      const currentHistory = predictionHistoryRef.current
      console.log('🔄 Aggregation timer triggered, history length:', currentHistory.length)
      
      if (currentHistory.length > 0) {
        const dominantStatus = getMostFrequentStatus(currentHistory)
        console.log('📊 Computed dominant status:', dominantStatus, 'from history:', currentHistory)
        
        // Send aggregated status to main process
        if (window.electron && window.electron.ipcRenderer) {
          console.log('📤 Sending aggregated status to main process:', dominantStatus)
          window.electron.ipcRenderer.send("aggregated-status", dominantStatus)
        } else {
          console.warn('⚠️ window.electron.ipcRenderer not available')
        }
      } else {
        console.log('📭 No prediction history to aggregate')
      }
    }, 5000)

    return () => {
      if (aggregationIntervalRef.current) {
        clearInterval(aggregationIntervalRef.current)
      }
    }
  }, []) // Remove dependency on predictionHistory

  const getMostFrequentStatus = (history: string[]): string => {
    const counts: { [key: string]: number } = {}
    
    // Count occurrences
    history.forEach(status => {
      counts[status] = (counts[status] || 0) + 1
    })
    
    // Find most frequent
    let maxCount = 0
    let dominantStatus = "alert" // default
    
    Object.entries(counts).forEach(([status, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominantStatus = status
      }
    })
    
    return dominantStatus
  }

  const addPredictionToHistory = (status: string) => {
    console.log('➕ Adding prediction to history:', status)
    setPredictionHistory(prev => {
      const newHistory = [...prev, status]
      // Keep only last 30 entries (30 seconds at ~1 prediction per second)
      const trimmedHistory = newHistory.slice(-30)
      console.log('📝 Updated prediction history:', trimmedHistory)
      return trimmedHistory
    })
  }

  const processFrame = async (frameSource: HTMLVideoElement | HTMLCanvasElement | ImageBitmap) => {
    if (!canvasRef.current || isProcessing) return

    setIsProcessing(true)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas dimensions
      canvas.width = 640
      canvas.height = 480

      // Draw the frame to canvas
      if (frameSource instanceof HTMLVideoElement) {
        ctx.drawImage(frameSource, 0, 0, canvas.width, canvas.height)
      } else if (frameSource instanceof HTMLCanvasElement) {
        ctx.drawImage(frameSource, 0, 0, canvas.width, canvas.height)
      } else if (frameSource instanceof ImageBitmap) {
        ctx.drawImage(frameSource, 0, 0, canvas.width, canvas.height)
      }

      // Convert canvas to base64
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1] // Remove data:image/jpeg;base64, prefix

      // Send to Python backend
      if (window.drowsiness && window.drowsiness.predictFromBase64) {
        const result = await window.drowsiness.predictFromBase64(base64)
        
        let mappedStatus: string
        
        // Map the Python result to our expected format
        if (result.status === 'alert' || result.status === 'drowsy') {
          mappedStatus = result.status
          onFatigueChange(result.status as "alert" | "drowsy")
        } else if (result.status === 'no_face') {
          // If no face detected, default to alert
          mappedStatus = 'alert'
          onFatigueChange('alert')
        } else {
          // For any other status (e.g., very_drowsy), keep the original status
          mappedStatus = result.status
          // But still notify the UI with the closest mapped status
          onFatigueChange(result.status === 'very_drowsy' ? 'drowsy' : 'alert')
        }
        
        // Add to prediction history
        addPredictionToHistory(mappedStatus)
        
        console.log('Prediction result:', result)
      }
    } catch (error) {
      console.error('Error processing frame:', error)
      // On error, default to alert status
      onFatigueChange('alert')
      addPredictionToHistory('alert')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'none' }} // Hidden canvas for processing
      width={640}
      height={480}
    />
  )
}
