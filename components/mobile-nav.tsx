"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Home, Shield, Camera, Car, Zap, Settings, User, LogOut, Wifi, Bell } from "lucide-react"

interface MobileNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user: any
  onLogout: () => void
  connectedDevices: number
  totalDevices: number
  alertCount: number
}

export function MobileNav({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  connectedDevices,
  totalDevices,
  alertCount,
}: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { id: "overview", label: "Overview", icon: Home, color: "text-cyan-400" },
    { id: "security", label: "Security", icon: Shield, color: "text-red-400" },
    { id: "cameras", label: "Cameras", icon: Camera, color: "text-blue-400" },
    { id: "vehicles", label: "Vehicles", icon: Car, color: "text-green-400" },
    { id: "energy", label: "Energy", icon: Zap, color: "text-yellow-400" },
    { id: "automation", label: "Automation", icon: Settings, color: "text-purple-400" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-gray-900 border-gray-700">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b border-gray-700">
            <SheetTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">NeuroHome AI</h2>
                <p className="text-xs text-gray-400">Smart Home Control</p>
              </div>
            </SheetTitle>
          </SheetHeader>

          {/* User Info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                {connectedDevices}/{totalDevices}
              </Badge>
              {alertCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <Bell className="h-3 w-3 mr-1" />
                  {alertCount} Alerts
                </Badge>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${activeTab === item.id ? item.color : ""}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-700">
            <Button onClick={onLogout} variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
