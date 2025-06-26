"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Shield, Camera, Car, Zap, Settings } from "lucide-react"

interface ResponsiveTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function ResponsiveTabs({ activeTab, setActiveTab }: ResponsiveTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: Home, color: "text-cyan-400" },
    { id: "security", label: "Security", icon: Shield, color: "text-red-400" },
    { id: "cameras", label: "Cameras", icon: Camera, color: "text-blue-400" },
    { id: "vehicles", label: "Vehicles", icon: Car, color: "text-green-400" },
    { id: "energy", label: "Energy", icon: Zap, color: "text-yellow-400" },
    { id: "automation", label: "Automation", icon: Settings, color: "text-purple-400" },
  ]

  return (
    <>
      {/* Desktop Tab Navigation - Hidden on mobile */}
      <div className="hidden md:flex bg-black/20 border border-gray-700 rounded-lg p-1">
        <div className="grid w-full grid-cols-6 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex items-center gap-2 text-sm ${
                  activeTab === tab.id ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className={`h-4 w-4 ${activeTab === tab.id ? tab.color : ""}`} />
                <span className="hidden lg:inline">{tab.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Mobile Tab Navigation - Horizontal scroll */}
      <div className="md:hidden">
        <ScrollArea className="w-full">
          <div className="flex gap-2 p-1 bg-black/20 border border-gray-700 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon className={`h-3 w-3 ${activeTab === tab.id ? tab.color : ""}`} />
                  <span>{tab.label}</span>
                </Button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
