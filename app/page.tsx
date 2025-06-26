"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/local-auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Shield,
  Thermometer,
  Zap,
  Settings,
  Camera,
  Car,
  Lightbulb,
  Lock,
  Activity,
  Wifi,
  User,
  LogOut,
  AlertTriangle,
  Play,
  RotateCcw,
  Battery,
  Fuel,
  Eye,
  Mic,
  MicOff,
  Bell,
  Sun,
  TrendingUp,
  Plus,
  Minus,
} from "lucide-react"
import ClientClock from "@/components/client-clock"
import HydrationSafeWrapper from "@/components/hydration-safe-wrapper"
import { MobileNav } from "@/components/mobile-nav"
import { ResponsiveTabs } from "@/components/responsive-tabs"
import { getInitialSmartHomeData, type SmartHomeData } from "@/lib/smart-home-data"

export default function SmartHomeDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [smartHomeData, setSmartHomeData] = useState<SmartHomeData>(getInitialSmartHomeData())
  const [activeTab, setActiveTab] = useState("overview")
  const [voiceControl, setVoiceControl] = useState(false)
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [currentInsight, setCurrentInsight] = useState(0)

  useEffect(() => {
    setMounted(true)

    if (!user) {
      router.push("/login")
      return
    }

    // Initialize AI insights
    const insights = [
      "🏠 All systems operating at 98% efficiency. Energy consumption optimized.",
      "🚗 Tesla Model 3 charging complete. Range: 402 miles available.",
      "🔒 Security system active. All entry points secured and monitored.",
      "💡 Smart lighting saved 23% energy this week with automated scheduling.",
      "🌱 Solar panels generated 4.8kW today, offsetting 150% of consumption.",
      "📱 24/26 devices online. Network performance excellent (94% signal strength).",
      "🌡️ Climate control maintaining optimal comfort across all zones.",
      "🎯 AI detected your evening routine. Preparing ambient lighting and security.",
    ]
    setAiInsights(insights)

    // Auto-rotate AI insights every 6 seconds
    const insightInterval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length)
    }, 6000)

    // Simulate real-time data updates
    const dataInterval = setInterval(() => {
      setSmartHomeData((prev) => ({
        ...prev,
        overview: {
          ...prev.overview,
          energyUsage: Math.max(1.5, prev.overview.energyUsage + (Math.random() - 0.5) * 0.3),
          temperature: prev.overview.temperature + (Math.random() - 0.5) * 0.2,
          humidity: Math.max(30, Math.min(70, prev.overview.humidity + (Math.random() - 0.5) * 2)),
        },
        energy: {
          ...prev.energy,
          currentUsage: Math.max(1.5, prev.energy.currentUsage + (Math.random() - 0.5) * 0.3),
          solarGeneration: Math.max(0, prev.energy.solarGeneration + (Math.random() - 0.5) * 0.5),
          batteryLevel: Math.max(20, Math.min(100, prev.energy.batteryLevel + (Math.random() - 0.5) * 1)),
        },
      }))
    }, 5000)

    return () => {
      clearInterval(insightInterval)
      clearInterval(dataInterval)
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const toggleDevice = (deviceType: string, deviceId: string, property: string) => {
    setSmartHomeData((prev) => ({
      ...prev,
      [deviceType]: prev[deviceType as keyof SmartHomeData].map((device: any) =>
        device.id === deviceId ? { ...device, [property]: !device[property] } : device,
      ),
    }))
  }

  const updateDeviceValue = (deviceType: string, deviceId: string, property: string, value: any) => {
    setSmartHomeData((prev) => ({
      ...prev,
      [deviceType]: prev[deviceType as keyof SmartHomeData].map((device: any) =>
        device.id === deviceId ? { ...device, [property]: value } : device,
      ),
    }))
  }

  const generateNewInsights = () => {
    const newInsights = [
      "🤖 AI Analysis: Your home's energy efficiency increased by 15% this month.",
      "📊 Predictive Analytics: Weather forecast suggests pre-cooling at 2 PM today.",
      "🔍 Pattern Recognition: Optimal garage door schedule detected for your routine.",
      "💰 Cost Optimization: Time-of-use billing could save $67/month with current usage.",
      "🌿 Environmental Impact: Your smart home prevented 420kg CO₂ emissions this year.",
      "🚨 Security Insight: Motion patterns suggest package delivery expected at 3 PM.",
      "⚡ Energy Forecast: Solar generation will peak at 5.2kW between 12-2 PM today.",
      "🏠 Automation Suggestion: Create 'Away Mode' scene for 18% additional energy savings.",
    ]
    setAiInsights(newInsights)
    setCurrentInsight(0)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your smart home...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const alertCount = smartHomeData.security.alerts.filter((alert) => !alert.resolved).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Mobile Nav */}
            <div className="flex items-center gap-3">
              <MobileNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                onLogout={handleLogout}
                connectedDevices={smartHomeData.overview.connectedDevices}
                totalDevices={smartHomeData.overview.totalDevices}
                alertCount={alertCount}
              />

              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                <Home className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold">NeuroHome AI</h1>
                <p className="text-xs lg:text-sm text-gray-400">Complete Smart Home Control</p>
              </div>
            </div>

            {/* Right side - Status and User */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Status Badge - Hidden on small mobile */}
              <Badge variant="outline" className="hidden sm:flex text-green-400 border-green-400 text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                {smartHomeData.overview.connectedDevices}/{smartHomeData.overview.totalDevices}
              </Badge>

              {/* Clock - Hidden on mobile */}
              <div className="hidden md:block">
                <HydrationSafeWrapper>
                  <ClientClock />
                </HydrationSafeWrapper>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm hidden lg:inline">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white p-2">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* AI Insights Banner */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-cyan-500/30">
          <CardContent className="p-3 lg:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg animate-pulse flex-shrink-0">
                  <Activity className="h-4 w-4 lg:h-5 lg:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm lg:text-base">AI Intelligence Center</h3>
                  <p className="text-xs lg:text-sm text-gray-300 line-clamp-2">
                    {aiInsights[currentInsight] || "Analyzing your smart home ecosystem..."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={() => setVoiceControl(!voiceControl)}
                  variant="outline"
                  size="sm"
                  className={`text-xs ${voiceControl ? "border-red-500 text-red-400" : "border-purple-500 text-purple-400"}`}
                >
                  {voiceControl ? <MicOff className="h-3 w-3 sm:mr-1" /> : <Mic className="h-3 w-3 sm:mr-1" />}
                  <span className="hidden sm:inline">{voiceControl ? "Stop Voice" : "Voice"}</span>
                </Button>
                <Button
                  onClick={generateNewInsights}
                  variant="outline"
                  size="sm"
                  className="border-cyan-500 text-cyan-400 text-xs"
                >
                  <span className="hidden sm:inline">Generate</span>
                  <span className="sm:hidden">AI</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Tab Navigation */}
        <ResponsiveTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="space-y-4 lg:space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Quick Status Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-white">Climate</CardTitle>
                    <Thermometer className="h-3 w-3 lg:h-4 lg:w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="text-lg lg:text-2xl font-bold text-blue-400">
                      {smartHomeData.overview.temperature.toFixed(1)}°C
                    </div>
                    <p className="text-xs text-gray-400">{smartHomeData.overview.humidity}% humidity</p>
                    <Progress value={smartHomeData.overview.airQuality} className="mt-2 h-1 lg:h-2" />
                    <p className="text-xs text-gray-400 mt-1">Air: {smartHomeData.overview.airQuality}%</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-white">Security</CardTitle>
                    <Shield
                      className={`h-3 w-3 lg:h-4 lg:w-4 ${smartHomeData.security.armed ? "text-green-400" : "text-yellow-400"}`}
                    />
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div
                      className={`text-lg lg:text-2xl font-bold ${smartHomeData.security.armed ? "text-green-400" : "text-yellow-400"}`}
                    >
                      {smartHomeData.security.armed ? "ARMED" : "OFF"}
                    </div>
                    <p className="text-xs text-gray-400">{smartHomeData.cameras.length} cameras</p>
                    <Progress value={smartHomeData.security.armed ? 100 : 50} className="mt-2 h-1 lg:h-2" />
                    <p className="text-xs text-gray-400 mt-1">{alertCount} alerts</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-white">Energy</CardTitle>
                    <Zap className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="text-lg lg:text-2xl font-bold text-yellow-400">
                      {smartHomeData.energy.currentUsage.toFixed(1)}kW
                    </div>
                    <p className="text-xs text-gray-400">Solar: {smartHomeData.energy.solarGeneration.toFixed(1)}kW</p>
                    <Progress value={smartHomeData.energy.batteryLevel} className="mt-2 h-1 lg:h-2" />
                    <p className="text-xs text-gray-400 mt-1">Battery: {smartHomeData.energy.batteryLevel}%</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-white">Devices</CardTitle>
                    <Wifi className="h-3 w-3 lg:h-4 lg:w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="text-lg lg:text-2xl font-bold text-purple-400">
                      {smartHomeData.overview.connectedDevices}/{smartHomeData.overview.totalDevices}
                    </div>
                    <p className="text-xs text-gray-400">Connected</p>
                    <Progress
                      value={(smartHomeData.overview.connectedDevices / smartHomeData.overview.totalDevices) * 100}
                      className="mt-2 h-1 lg:h-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">94% signal</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Controls */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-cyan-500/50 transition-colors cursor-pointer">
                  <CardContent className="p-3 lg:p-4 text-center">
                    <div className="flex items-center justify-between mb-2">
                      <Lightbulb className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400" />
                      <Switch
                        checked={smartHomeData.lights.some((light) => light.isOn)}
                        onCheckedChange={(checked) => {
                          smartHomeData.lights.forEach((light) => {
                            toggleDevice("lights", light.id, "isOn")
                          })
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium">All Lights</p>
                    <p className="text-xs text-gray-400">
                      {smartHomeData.lights.filter((l) => l.isOn).length}/{smartHomeData.lights.length} on
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-green-500/50 transition-colors cursor-pointer">
                  <CardContent className="p-3 lg:p-4 text-center">
                    <div className="flex items-center justify-between mb-2">
                      <Lock className="h-4 w-4 lg:h-5 lg:w-5 text-green-400" />
                      <Switch
                        checked={smartHomeData.doors.every((door) => door.isLocked)}
                        onCheckedChange={(checked) => {
                          smartHomeData.doors.forEach((door) => {
                            if (door.isLocked !== checked) {
                              toggleDevice("doors", door.id, "isLocked")
                            }
                          })
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium">All Doors</p>
                    <p className="text-xs text-gray-400">
                      {smartHomeData.doors.filter((d) => d.isLocked).length}/{smartHomeData.doors.length} locked
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-red-500/50 transition-colors cursor-pointer">
                  <CardContent className="p-3 lg:p-4 text-center">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-red-400" />
                      <Switch
                        checked={smartHomeData.security.armed}
                        onCheckedChange={(checked) => {
                          setSmartHomeData((prev) => ({
                            ...prev,
                            security: { ...prev.security, armed: checked },
                          }))
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium">Security</p>
                    <p className="text-xs text-gray-400">{smartHomeData.security.armed ? "Armed" : "Disarmed"}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer">
                  <CardContent className="p-3 lg:p-4 text-center">
                    <div className="flex items-center justify-between mb-2">
                      <Camera className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" />
                      <Badge variant="outline" className="text-xs">
                        {smartHomeData.cameras.filter((c) => c.isRecording).length} REC
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">Cameras</p>
                    <p className="text-xs text-gray-400">{smartHomeData.cameras.length} active</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Alerts */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-orange-400" />
                    Recent Alerts & Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 lg:h-auto">
                    <div className="space-y-3">
                      {smartHomeData.security.alerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                alert.severity === "critical"
                                  ? "bg-red-500"
                                  : alert.severity === "high"
                                    ? "bg-orange-500"
                                    : alert.severity === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{alert.message}</p>
                              <p className="text-xs text-gray-400">
                                {alert.location} • {new Date(alert.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={alert.resolved ? "secondary" : "destructive"}
                            className="text-xs flex-shrink-0"
                          >
                            {alert.resolved ? "OK" : "Active"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              {/* Security Status */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-red-400" />
                    Security System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm lg:text-base">System Status</h4>
                      <p className="text-xs lg:text-sm text-gray-400">Main security system</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={smartHomeData.security.armed ? "bg-red-600" : "bg-gray-600"}>
                        {smartHomeData.security.armed ? "ARMED" : "OFF"}
                      </Badge>
                      <Switch
                        checked={smartHomeData.security.armed}
                        onCheckedChange={(checked) => {
                          setSmartHomeData((prev) => ({
                            ...prev,
                            security: { ...prev.security, armed: checked },
                          }))
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm lg:text-base">Entry Points</h4>
                    <ScrollArea className="h-64 lg:h-auto">
                      {smartHomeData.doors.map((door) => (
                        <div
                          key={door.id}
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg mb-2"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Lock
                              className={`h-4 w-4 flex-shrink-0 ${door.isLocked ? "text-green-400" : "text-red-400"}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{door.name}</p>
                              <p className="text-xs text-gray-400">{door.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={door.isLocked ? "secondary" : "destructive"} className="text-xs">
                              {door.isLocked ? "Locked" : "Open"}
                            </Badge>
                            <Switch
                              checked={door.isLocked}
                              onCheckedChange={() => toggleDevice("doors", door.id, "isLocked")}
                            />
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>

              {/* Security Alerts */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-orange-400" />
                    Security Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 lg:h-auto">
                    <div className="space-y-3">
                      {smartHomeData.security.alerts.map((alert) => (
                        <div key={alert.id} className="p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant={
                                alert.severity === "critical"
                                  ? "destructive"
                                  : alert.severity === "high"
                                    ? "destructive"
                                    : alert.severity === "medium"
                                      ? "secondary"
                                      : "outline"
                              }
                              className="text-xs"
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{alert.location}</p>
                          {!alert.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 text-xs"
                              onClick={() => {
                                setSmartHomeData((prev) => ({
                                  ...prev,
                                  security: {
                                    ...prev.security,
                                    alerts: prev.security.alerts.map((a) =>
                                      a.id === alert.id ? { ...a, resolved: true } : a,
                                    ),
                                  },
                                }))
                              }}
                            >
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cameras Tab */}
          {activeTab === "cameras" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {smartHomeData.cameras.map((camera) => (
                <Card key={camera.id} className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-sm lg:text-base">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" />
                        <span className="truncate">{camera.name}</span>
                      </div>
                      <Badge variant={camera.status === "online" ? "secondary" : "destructive"} className="text-xs">
                        {camera.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Camera Preview */}
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative">
                      <Camera className="h-8 w-8 lg:h-12 lg:w-12 text-gray-600" />
                      {camera.isRecording && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          REC
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                        {camera.resolution}
                      </div>
                    </div>

                    {/* Camera Controls */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Recording</span>
                        <Switch
                          checked={camera.isRecording}
                          onCheckedChange={() => toggleDevice("cameras", camera.id, "isRecording")}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Motion Detection</span>
                        <Switch
                          checked={camera.motionDetection}
                          onCheckedChange={() => toggleDevice("cameras", camera.id, "motionDetection")}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Night Vision</span>
                        <Switch
                          checked={camera.nightVision}
                          onCheckedChange={() => toggleDevice("cameras", camera.id, "nightVision")}
                        />
                      </div>
                    </div>

                    {/* Camera Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Location</p>
                        <p className="font-medium truncate">{camera.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Alerts</p>
                        <p className="font-medium">{camera.alerts}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        <span className="hidden sm:inline">Live View</span>
                        <span className="sm:hidden">Live</span>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <RotateCcw className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        <span className="hidden sm:inline">Playback</span>
                        <span className="sm:hidden">Play</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === "vehicles" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {smartHomeData.vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-sm lg:text-base">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 lg:h-5 lg:w-5 text-green-400" />
                        <span className="truncate">{vehicle.name}</span>
                      </div>
                      <Badge
                        variant={
                          vehicle.status === "parked"
                            ? "secondary"
                            : vehicle.status === "driving"
                              ? "destructive"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {vehicle.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Vehicle Status */}
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                        {vehicle.batteryLevel ? (
                          <>
                            <Battery className="h-5 w-5 lg:h-6 lg:w-6 text-green-400 mx-auto mb-1" />
                            <p className="text-xs lg:text-sm text-gray-400">Battery</p>
                            <p className="text-base lg:text-lg font-bold text-green-400">{vehicle.batteryLevel}%</p>
                          </>
                        ) : (
                          <>
                            <Fuel className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400 mx-auto mb-1" />
                            <p className="text-xs lg:text-sm text-gray-400">Fuel</p>
                            <p className="text-base lg:text-lg font-bold text-blue-400">{vehicle.fuelLevel}%</p>
                          </>
                        )}
                      </div>
                      <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                        <Lock
                          className={`h-5 w-5 lg:h-6 lg:w-6 ${vehicle.isLocked ? "text-green-400" : "text-red-400"} mx-auto mb-1`}
                        />
                        <p className="text-xs lg:text-sm text-gray-400">Security</p>
                        <p
                          className={`text-base lg:text-lg font-bold ${vehicle.isLocked ? "text-green-400" : "text-red-400"}`}
                        >
                          {vehicle.isLocked ? "Locked" : "Open"}
                        </p>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Location</span>
                        <span className="text-sm font-medium truncate ml-2">{vehicle.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Last Updated</span>
                        <span className="text-sm font-medium">
                          {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Controls */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleDevice("vehicles", vehicle.id, "isLocked")}
                        className={`text-xs ${vehicle.isLocked ? "border-red-500 text-red-400" : "border-green-500 text-green-400"}`}
                      >
                        <Lock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        {vehicle.isLocked ? "Unlock" : "Lock"}
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Activity className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        Status
                      </Button>
                      {vehicle.batteryLevel && (
                        <>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                            <span className="hidden sm:inline">Start Charge</span>
                            <span className="sm:hidden">Charge</span>
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Thermometer className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                            Climate
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Energy Tab */}
          {activeTab === "energy" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              {/* Energy Overview */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Zap className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400" />
                    Energy Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-red-400 mx-auto mb-1" />
                      <p className="text-xs lg:text-sm text-gray-400">Current Usage</p>
                      <p className="text-base lg:text-lg font-bold text-red-400">
                        {smartHomeData.energy.currentUsage.toFixed(1)} kW
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                      <Sun className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs lg:text-sm text-gray-400">Solar Generation</p>
                      <p className="text-base lg:text-lg font-bold text-yellow-400">
                        {smartHomeData.energy.solarGeneration.toFixed(1)} kW
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Battery Level</span>
                        <span className="text-sm font-medium">{smartHomeData.energy.batteryLevel}%</span>
                      </div>
                      <Progress value={smartHomeData.energy.batteryLevel} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Daily Usage</p>
                        <p className="font-medium">{smartHomeData.energy.dailyUsage} kWh</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Monthly Cost</p>
                        <p className="font-medium">${smartHomeData.energy.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Device Energy Usage */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-purple-400" />
                    Device Energy Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 lg:h-auto">
                    <div className="space-y-3">
                      {smartHomeData.lights.map((light) => (
                        <div key={light.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Lightbulb
                              className={`h-4 w-4 flex-shrink-0 ${light.isOn ? "text-yellow-400" : "text-gray-400"}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{light.name}</p>
                              <p className="text-xs text-gray-400">{light.location}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium">{light.energyUsage}W</p>
                            <p className="text-xs text-gray-400">{light.isOn ? "Active" : "Off"}</p>
                          </div>
                        </div>
                      ))}

                      {smartHomeData.thermostats.map((thermostat) => (
                        <div
                          key={thermostat.id}
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Thermometer className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{thermostat.name}</p>
                              <p className="text-xs text-gray-400">{thermostat.location}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium">1.2kW</p>
                            <p className="text-xs text-gray-400">{thermostat.mode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Automation Tab */}
          {activeTab === "automation" && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                {/* Automation Rules */}
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Settings className="h-4 w-4 lg:h-5 lg:w-5 text-purple-400" />
                      Automation Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 lg:h-auto">
                      <div className="space-y-3">
                        {smartHomeData.automation.rules.map((rule) => (
                          <div
                            key={rule.id}
                            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{rule.name}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {rule.trigger} → {rule.action}
                              </p>
                            </div>
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={(checked) => {
                                setSmartHomeData((prev) => ({
                                  ...prev,
                                  automation: {
                                    ...prev.automation,
                                    rules: prev.automation.rules.map((r) =>
                                      r.id === rule.id ? { ...r, enabled: checked } : r,
                                    ),
                                  },
                                }))
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <Button className="w-full mt-4 text-xs" variant="outline">
                      <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Add New Rule
                    </Button>
                  </CardContent>
                </Card>

                {/* Scenes */}
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Home className="h-4 w-4 lg:h-5 lg:w-5 text-cyan-400" />
                      Smart Scenes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 lg:h-auto">
                      <div className="space-y-3">
                        {smartHomeData.automation.scenes.map((scene) => (
                          <div key={scene.id} className="p-3 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium truncate flex-1">{scene.name}</p>
                              <Switch
                                checked={scene.enabled}
                                onCheckedChange={(checked) => {
                                  setSmartHomeData((prev) => ({
                                    ...prev,
                                    automation: {
                                      ...prev.automation,
                                      scenes: prev.automation.scenes.map((s) =>
                                        s.id === scene.id ? { ...s, enabled: checked } : s,
                                      ),
                                    },
                                  }))
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{scene.devices.length} devices</p>
                            <Button size="sm" variant="outline" className="w-full text-xs">
                              <Play className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                              Activate Scene
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <Button className="w-full mt-4 text-xs" variant="outline">
                      <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Create New Scene
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Climate Control */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Thermometer className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" />
                    Climate Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {smartHomeData.thermostats.map((thermostat) => (
                      <div key={thermostat.id} className="space-y-4">
                        <div className="text-center">
                          <h4 className="font-medium text-sm lg:text-base">{thermostat.name}</h4>
                          <p className="text-xs lg:text-sm text-gray-400">{thermostat.location}</p>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-2">
                            {thermostat.currentTemp.toFixed(1)}°C
                          </div>
                          <p className="text-xs lg:text-sm text-gray-400">Current Temperature</p>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Target Temperature</span>
                              <span className="text-sm font-medium">{thermostat.targetTemp}°C</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateDeviceValue(
                                    "thermostats",
                                    thermostat.id,
                                    "targetTemp",
                                    thermostat.targetTemp - 1,
                                  )
                                }
                                className="flex-shrink-0"
                              >
                                <Minus className="h-3 w-3 lg:h-4 lg:w-4" />
                              </Button>
                              <Slider
                                value={[thermostat.targetTemp]}
                                onValueChange={(value) =>
                                  updateDeviceValue("thermostats", thermostat.id, "targetTemp", value[0])
                                }
                                max={30}
                                min={15}
                                step={0.5}
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateDeviceValue(
                                    "thermostats",
                                    thermostat.id,
                                    "targetTemp",
                                    thermostat.targetTemp + 1,
                                  )
                                }
                                className="flex-shrink-0"
                              >
                                <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {["heat", "cool", "auto", "off"].map((mode) => (
                              <Button
                                key={mode}
                                size="sm"
                                variant={thermostat.mode === mode ? "default" : "outline"}
                                onClick={() => updateDeviceValue("thermostats", thermostat.id, "mode", mode)}
                                className="capitalize text-xs"
                              >
                                {mode}
                              </Button>
                            ))}
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Humidity</span>
                            <span className="font-medium">{thermostat.humidity}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
