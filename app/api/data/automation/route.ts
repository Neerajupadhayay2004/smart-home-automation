import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/services/data-service"

export async function POST(request: NextRequest) {
  try {
    const ruleData = await request.json()

    const rule = await dataService.createAutomationRule(ruleData)

    // Log activity
    await dataService.logActivity({
      type: "AUTOMATION_CREATED",
      title: `Automation Rule Created: ${rule.name}`,
      description: rule.description || "",
      userId: ruleData.userId || "system",
      metadata: { ruleId: rule.id },
    })

    return NextResponse.json({
      success: true,
      rule,
    })
  } catch (error) {
    console.error("Error creating automation rule:", error)
    return NextResponse.json({ error: "Failed to create automation rule" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { ruleId, success, duration, error: execError, metadata } = await request.json()

    if (!ruleId || success === undefined) {
      return NextResponse.json({ error: "Missing ruleId or success status" }, { status: 400 })
    }

    const execution = await dataService.executeAutomationRule(ruleId, success, duration, execError, metadata)

    return NextResponse.json({
      success: true,
      execution,
    })
  } catch (error) {
    console.error("Error logging automation execution:", error)
    return NextResponse.json({ error: "Failed to log automation execution" }, { status: 500 })
  }
}
