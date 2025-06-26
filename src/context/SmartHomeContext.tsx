"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

interface SmartHomeData {
  security: any
  energy: any
  environment: any
  alerts: any[]
  systemHealth: any
}

interface SmartHomeContextType {
  data: SmartHomeData
  loading: boolean
  refreshData: () => void
  controlDevice: (deviceId: string, action: string, value?: any) => Promise<boolean>
  armSecurity: (armed: boolean) => Promise<boolean>
  dismissAlert: (alertId: string) => void
}

const SmartHomeContext = createContext<SmartHomeContextType | undefined>(undefined)

export const useSmartHome = () => {
  const context = useContext(SmartHomeContext)
  if (!context) {
    throw new Error("useSmartHome must be used within a SmartHomeProvider")
  }
  return context
}

export const SmartHomeProvider: React.FC<{ children: React.ReactNode; socket: any }> = ({ children, socket }) => {
  const [data, setData] = useState<SmartHomeData>({
    security: {
      armed: true,
      intrusion: false,
      cameras: [],
      doors: [],
      lights: [],
    },
    energy: {
      currentPower: 0,
      dailyCost: 0,
      devices: [],
      solarGeneration: 0,
      batteryLevel: 0,
    },
    environment: {
      temperature: 0,
      humidity: 0,
      airQuality: 0,
      co2: 0,
    },
    alerts: [],
    systemHealth: {
      internetSpeed: 0,
      wifiStrength: 0,
      systemLoad: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshData()

    // Set up real-time updates
    if (socket) {
      socket.on("dataUpdate", (newData: any) => {
        setData((prevData) => ({ ...prevData, ...newData }))
      })

      socket.on("newAlert", (alert: any) => {
        setData((prevData) => ({
          ...prevData,
          alerts: [alert, ...prevData.alerts.slice(0, 9)],
        }))
      })
    }

    // Refresh data every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [socket])

  const refreshData = async () => {
    try {
      setLoading(true)
      const response = await axios.get("https://your-api.com/smart-home/status")
      setData(response.data)
    } catch (error) {
      console.error("Failed to refresh data:", error)
      // Use mock data for demo
      setData({
        security: {
          armed: true,
          intrusion: false,
          cameras: [
            { id: "1", name: "Front Door", status: "active", recording: false },
            { id: "2", name: "Back Yard", status: "active", recording: false },
            { id: "3", name: "Living Room", status: "active", recording: false },
          ],
          doors: [
            { id: "1", name: "Front Door", locked: true },
            { id: "2", name: "Back Door", locked: true },
            { id: "3", name: "Garage", locked: false },
          ],
          lights: [
            { id: "1", name: "Porch Light", on: false, brightness: 0 },
            { id: "2", name: "Security Lights", on: false, brightness: 0 },
            { id: "3", name: "Living Room", on: true, brightness: 75 },
          ],
        },
        energy: {
          currentPower: 2850,
          dailyCost: 3.92,
          devices: [
            { id: "1", name: "HVAC System", power: 1200, status: "on" },
            { id: "2", name: "Security System", power: 45, status: "on" },
            { id: "3", name: "LED Lights", power: 180, status: "on" },
          ],
          solarGeneration: 450,
          batteryLevel: 68,
        },
        environment: {
          temperature: 22.5,
          humidity: 45,
          airQuality: 85,
          co2: 420,
        },
        alerts: [
          {
            id: "1",
            type: "security",
            message: "Motion detected at front door",
            severity: "low",
            timestamp: new Date().toISOString(),
          },
        ],
        systemHealth: {
          internetSpeed: 125.5,
          wifiStrength: 92,
          systemLoad: 34,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const controlDevice = async (deviceId: string, action: string, value?: any): Promise<boolean> => {
    try {
      const response = await axios.post("https://your-api.com/smart-home/control", {
        deviceId,
        action,
        value,
      })

      if (response.status === 200) {
        refreshData()
        return true
      }
      return false
    } catch (error) {
      console.error("Device control error:", error)
      return false
    }
  }

  const armSecurity = async (armed: boolean): Promise<boolean> => {
    try {
      const response = await axios.post("https://your-api.com/smart-home/security/arm", {
        armed,
      })

      if (response.status === 200) {
        setData((prevData) => ({
          ...prevData,
          security: { ...prevData.security, armed },
        }))
        return true
      }
      return false
    } catch (error) {
      console.error("Security arm error:", error)
      return false
    }
  }

  const dismissAlert = (alertId: string) => {
    setData((prevData) => ({
      ...prevData,
      alerts: prevData.alerts.filter((alert) => alert.id !== alertId),
    }))
  }

  return (
    <SmartHomeContext.Provider
      value={{
        data,
        loading,
        refreshData,
        controlDevice,
        armSecurity,
        dismissAlert,
      }}
    >
      {children}
    </SmartHomeContext.Provider>
  )
}
