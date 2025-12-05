"use client";

import { Button } from "@/components/ui/button";
import { Settings, Minimize2, Maximize2, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface TitleBarProps {
  onMinimize?: () => void;
  isMinimized?: boolean;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
}

export function TitleBar({
  onMinimize,
  isMinimized = false,
  onOpenSettings,
  onOpenHelp,
}: TitleBarProps) {
  const [status, setStatus] = useState<string>("alert");

  useEffect(() => {
    // Listen for status updates when in mini mode
    if (
      isMinimized &&
      window.drowsiness &&
      window.drowsiness.onMiniStatusUpdate
    ) {
      const statusCallback = (newStatus: string) => {
        setStatus(newStatus);
      };

      window.drowsiness.onMiniStatusUpdate(statusCallback);
    }
  }, [isMinimized]);

  const getStatusEmoji = (status: string): string => {
    const emoji = (() => {
      switch (status) {
        case "alert":
          return "🙂";
        case "drowsy":
        case "very_drowsy":
          return "😴";
        default:
          return "❓";
      }
    })();

    return emoji;
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 "
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Left side - App title */}
      <div className="flex justify-center items-center w-full">
        <h1 className="text-slate-700 dark:text-slate-300">
          {isMinimized ? (
            <span className="text-2xl">{getStatusEmoji(status)}</span>
          ) : (
            // Breakpoint
            ""
          )}
        </h1>
      </div>

      {/* Right side - Controls */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {onOpenHelp && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8"
            onClick={onOpenHelp}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8"
          onClick={onOpenSettings}
        >
          <Settings className="w-4 h-4" />
        </Button>
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8"
            onClick={onMinimize}
            title={isMinimized ? "Restore window" : "Enter mini mode"}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}