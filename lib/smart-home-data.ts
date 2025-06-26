export interface SmartHomeData {
  overview: {
    temperature: number
    humidity: number
    airQuality: number
    energyUsage: number
    connectedDevices: number
    totalDevices: number
  }
  security: {
    armed: boolean
    alerts: Array<{
      id: string
      message: string
      severity: "low" | "medium" | "high" | "critical"
      location: string
      timestamp: string
      resolved: boolean
    }>
  }
  cameras: Array<{
    id: string
    name: string
    location: string
    status: "online" | "offline"
    isRecording: boolean
    motionDetection: boolean
    nightVision: boolean
    resolution: string
    alerts: number
  }>
  vehicles: Array<{
    id: string
    name: string
    type: "electric" | "gas"
    status: "parked" | "driving" | "charging"
    location: string
    isLocked: boolean
    batteryLevel?: number
    fuelLevel?: number
    lastUpdated: string
  }>
  lights: Array<{
    id: string
    name: string
    location: string
    isOn: boolean
    brightness: number
    energyUsage: number
  }>
  doors: Array<{
    id: string
    name: string
    location: string
    isLocked: boolean
    batteryLevel: number
  }>
  thermostats: Array<{
    id: string
    name: string
    location: string
    currentTemp: number
    targetTemp: number
    humidity: number
    mode: "heat" | "cool" | "auto" | "off"
  }>
  energy: {
    currentUsage: number
    solarGeneration: number
    batteryLevel: number
    dailyUsage: number
    cost: number
  }
  automation: {
    rules: Array<{
      id: string
      name: string
      trigger: string
      action: string
      enabled: boolean
    }>
    scenes: Array<{
      id: string
      name: string
      devices: string[]
      enabled: boolean
    }>
  }
}

export function getInitialSmartHomeData(): SmartHomeData {
  return {
    overview: {
      temperature: 22.5,
      humidity: 45,
      airQuality: 92,
      energyUsage: 3.2,
      connectedDevices: 24,
      totalDevices: 26,
    },
    security: {
      armed: true,
      alerts: [
        {
          id: "alert-1",
          message: "Motion detected at front door",
          severity: "medium",
          location: "Front Entrance",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          resolved: false,
        },
        {
          id: "alert-2",
          message: "Garage door left open for 2 hours",
          severity: "high",
          location: "Garage",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          resolved: false,
        },
        {
          id: "alert-3",
          message: "Security system armed successfully",
          severity: "low",
          location: "Main Panel",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          resolved: true,
        },
        {
          id: "alert-4",
          message: "Unusual activity detected in backyard",
          severity: "critical",
          location: "Backyard",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          resolved: false,
        },
        {
          id: "alert-5",
          message: "Window sensor battery low",
          severity: "medium",
          location: "Living Room Window",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: false,
        },
      ],
    },
    cameras: [
      {
        id: "cam-1",
        name: "Front Door Camera",
        location: "Front Entrance",
        status: "online",
        isRecording: true,
        motionDetection: true,
        nightVision: true,
        resolution: "4K",
        alerts: 3,
      },
      {
        id: "cam-2",
        name: "Backyard Camera",
        location: "Backyard",
        status: "online",
        isRecording: true,
        motionDetection: true,
        nightVision: true,
        resolution: "1080p",
        alerts: 1,
      },
      {
        id: "cam-3",
        name: "Garage Camera",
        location: "Garage",
        status: "online",
        isRecording: false,
        motionDetection: true,
        nightVision: false,
        resolution: "1080p",
        alerts: 0,
      },
      {
        id: "cam-4",
        name: "Living Room Camera",
        location: "Living Room",
        status: "offline",
        isRecording: false,
        motionDetection: false,
        nightVision: false,
        resolution: "720p",
        alerts: 0,
      },
    ],
    vehicles: [
      {
        id: "vehicle-1",
        name: "Tesla Model 3",
        type: "electric",
        status: "parked",
        location: "Home Garage",
        isLocked: true,
        batteryLevel: 87,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "vehicle-2",
        name: "BMW X5",
        type: "gas",
        status: "parked",
        location: "Driveway",
        isLocked: true,
        fuelLevel: 65,
        lastUpdated: new Date().toISOString(),
      },
    ],
    lights: [
      {
        id: "light-1",
        name: "Living Room Lights",
        location: "Living Room",
        isOn: true,
        brightness: 75,
        energyUsage: 45,
      },
      {
        id: "light-2",
        name: "Kitchen Lights",
        location: "Kitchen",
        isOn: true,
        brightness: 90,
        energyUsage: 32,
      },
      {
        id: "light-3",
        name: "Bedroom Lights",
        location: "Master Bedroom",
        isOn: false,
        brightness: 0,
        energyUsage: 0,
      },
      {
        id: "light-4",
        name: "Outdoor Lights",
        location: "Front Yard",
        isOn: true,
        brightness: 60,
        energyUsage: 28,
      },
    ],
    doors: [
      {
        id: "door-1",
        name: "Front Door",
        location: "Front Entrance",
        isLocked: true,
        batteryLevel: 85,
      },
      {
        id: "door-2",
        name: "Back Door",
        location: "Back Entrance",
        isLocked: true,
        batteryLevel: 92,
      },
      {
        id: "door-3",
        name: "Garage Door",
        location: "Garage",
        isLocked: false,
        batteryLevel: 78,
      },
      {
        id: "door-4",
        name: "Side Gate",
        location: "Side Yard",
        isLocked: true,
        batteryLevel: 65,
      },
    ],
    thermostats: [
      {
        id: "thermo-1",
        name: "Living Room Thermostat",
        location: "Living Room",
        currentTemp: 22.5,
        targetTemp: 23.0,
        humidity: 45,
        mode: "auto",
      },
      {
        id: "thermo-2",
        name: "Bedroom Thermostat",
        location: "Master Bedroom",
        currentTemp: 21.8,
        targetTemp: 22.0,
        humidity: 42,
        mode: "cool",
      },
    ],
    energy: {
      currentUsage: 3.2,
      solarGeneration: 4.8,
      batteryLevel: 78,
      dailyUsage: 28.5,
      cost: 156.78,
    },
    automation: {
      rules: [
        {
          id: "rule-1",
          name: "Evening Lights",
          trigger: "Sunset",
          action: "Turn on outdoor lights",
          enabled: true,
        },
        {
          id: "rule-2",
          name: "Security Mode",
          trigger: "All doors locked",
          action: "Arm security system",
          enabled: true,
        },
        {
          id: "rule-3",
          name: "Energy Saver",
          trigger: "No motion for 30 min",
          action: "Reduce thermostat by 2°C",
          enabled: false,
        },
        {
          id: "rule-4",
          name: "Morning Routine",
          trigger: "6:30 AM weekdays",
          action: "Turn on kitchen lights",
          enabled: true,
        },
      ],
      scenes: [
        {
          id: "scene-1",
          name: "Movie Night",
          devices: ["light-1", "light-2", "thermo-1"],
          enabled: true,
        },
        {
          id: "scene-2",
          name: "Good Night",
          devices: ["light-1", "light-2", "light-3", "door-1", "door-2"],
          enabled: true,
        },
        {
          id: "scene-3",
          name: "Away Mode",
          devices: ["light-4", "cam-1", "cam-2", "thermo-1", "thermo-2"],
          enabled: false,
        },
      ],
    },
  }
}
