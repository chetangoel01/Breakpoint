"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export function TitleBar() {
  return (
    <div className="fixed top-0 right-0 z-50 flex items-center gap-2 p-4">
      <ThemeToggle />
      <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  )
} 