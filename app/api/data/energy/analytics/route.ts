import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/services/data-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const homeId = searchParams.get("homeId")
    const period = (searchParams.get("period") as "day" | "week" | "month") || "week"

    if (!homeId) {
      return NextResponse.json({ error: "Missing homeId parameter" }, { status: 400 })
    }

    const trends = await dataService.getEnergyTrends(homeId, period)
    const analytics = await dataService.getEnergyAnalytics(homeId, 30)

    return NextResponse.json({
      success: true,
      trends,
      analytics,
      period,
    })
  } catch (error) {
    console.error("Error fetching energy analytics:", error)
    return NextResponse.json({ error: "Failed to fetch energy analytics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { homeId, date, data } = await request.json()

    if (!homeId || !date || !data) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const result = await dataService.saveEnergyAnalytics(homeId, new Date(date), data)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Error saving energy analytics:", error)
    return NextResponse.json({ error: "Failed to save energy analytics" }, { status: 500 })
  }
}
