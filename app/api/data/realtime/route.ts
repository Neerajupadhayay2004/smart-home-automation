import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/services/data-service"

export async function POST(request: NextRequest) {
  try {
    const { homeId, data } = await request.json()

    if (!homeId || !data) {
      return NextResponse.json({ error: "Missing homeId or data" }, { status: 400 })
    }

    // Save real-time data to MongoDB
    const result = await dataService.saveRealtimeData(homeId, data)

    return NextResponse.json({
      success: true,
      id: result._id,
      timestamp: result.timestamp,
    })
  } catch (error) {
    console.error("Error saving real-time data:", error)
    return NextResponse.json({ error: "Failed to save real-time data" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const homeId = searchParams.get("homeId")
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    if (!homeId) {
      return NextResponse.json({ error: "Missing homeId parameter" }, { status: 400 })
    }

    const data = await dataService.getRealtimeData(homeId, hours)

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    })
  } catch (error) {
    console.error("Error fetching real-time data:", error)
    return NextResponse.json({ error: "Failed to fetch real-time data" }, { status: 500 })
  }
}
