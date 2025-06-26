import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Simulate real-time sensor data
    const sensorData = {
      timestamp: new Date().toISOString(),
      environmental: {
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 30,
        airQuality: 70 + Math.random() * 30,
        co2: 400 + Math.random() * 200,
        pressure: 1010 + Math.random() * 10,
        uvIndex: Math.max(0, Math.min(11, 2 + Math.random() * 6)),
      },
      energy: {
        currentPower: 2500 + Math.random() * 800,
        solarGeneration: Math.max(
          0,
          200 + Math.random() * 500 - (new Date().getHours() > 18 || new Date().getHours() < 6 ? 400 : 0),
        ),
        batteryLevel: 60 + Math.random() * 30,
        gridStatus: Math.random() > 0.95 ? "backup" : "connected",
      },
      security: {
        motionDetected: Math.random() > 0.9,
        cameraStatus: "active",
        doorStatus: "locked",
        systemArmed: true,
      },
      system: {
        internetSpeed: 100 + Math.random() * 50,
        wifiStrength: 85 + Math.random() * 15,
        systemLoad: 20 + Math.random() * 40,
        connectedDevices: 45 + Math.floor(Math.random() * 10),
      },
    }

    return NextResponse.json(sensorData)
  } catch (error) {
    console.error("Live Monitoring Error:", error)
    return NextResponse.json({ error: "Failed to fetch live data" }, { status: 500 })
  }
}
