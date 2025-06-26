import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/services/data-service"

export async function POST(request: NextRequest) {
  try {
    const deviceData = await request.json()

    const device = await dataService.addDevice(deviceData)

    // Log activity
    await dataService.logActivity({
      type: "DEVICE_ADDED",
      title: `Device Added: ${device.name}`,
      description: `Added ${device.type} device to ${device.homeId}`,
      userId: deviceData.userId || "system",
      metadata: { deviceId: device.id, deviceType: device.type },
    })

    return NextResponse.json({
      success: true,
      device,
    })
  } catch (error) {
    console.error("Error adding device:", error)
    return NextResponse.json({ error: "Failed to add device" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { deviceId, status, metrics } = await request.json()

    if (!deviceId || !status) {
      return NextResponse.json({ error: "Missing deviceId or status" }, { status: 400 })
    }

    // Update device status in PostgreSQL
    const device = await dataService.updateDeviceStatus(deviceId, status)

    // Save metrics to MongoDB if provided
    if (metrics) {
      await dataService.saveDeviceMetrics(deviceId, device.homeId, metrics, status)
    }

    return NextResponse.json({
      success: true,
      device,
    })
  } catch (error) {
    console.error("Error updating device:", error)
    return NextResponse.json({ error: "Failed to update device" }, { status: 500 })
  }
}
