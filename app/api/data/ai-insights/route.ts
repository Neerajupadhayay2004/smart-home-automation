import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/services/data-service"

export async function POST(request: NextRequest) {
  try {
    const insightData = await request.json()

    const insight = await dataService.saveAIInsight(insightData)

    return NextResponse.json({
      success: true,
      insight,
    })
  } catch (error) {
    console.error("Error saving AI insight:", error)
    return NextResponse.json({ error: "Failed to save AI insight" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const homeId = searchParams.get("homeId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!homeId) {
      return NextResponse.json({ error: "Missing homeId parameter" }, { status: 400 })
    }

    const insights = await dataService.getAIInsights(homeId, limit)

    return NextResponse.json({
      success: true,
      insights,
      count: insights.length,
    })
  } catch (error) {
    console.error("Error fetching AI insights:", error)
    return NextResponse.json({ error: "Failed to fetch AI insights" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { insightId } = await request.json()

    if (!insightId) {
      return NextResponse.json({ error: "Missing insightId" }, { status: 400 })
    }

    const insight = await dataService.acknowledgeAIInsight(insightId)

    return NextResponse.json({
      success: true,
      insight,
    })
  } catch (error) {
    console.error("Error acknowledging AI insight:", error)
    return NextResponse.json({ error: "Failed to acknowledge AI insight" }, { status: 500 })
  }
}
