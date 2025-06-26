import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI("AIzaSyCF0864FdCMZWgEXiN8uzMpyQTfiuo2uug")

export async function POST(request: NextRequest) {
  try {
    const { environmentalData, securityStatus, alerts } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
As a smart home AI assistant, analyze the following data and provide intelligent insights and recommendations:

Environmental Data:
- Temperature: ${environmentalData.temperature.toFixed(1)}°C
- Humidity: ${environmentalData.humidity.toFixed(0)}%
- Air Quality: ${environmentalData.airQuality.toFixed(0)}/100
- CO2 Level: ${environmentalData.co2.toFixed(0)} ppm

Security Status:
- System Armed: ${securityStatus.armed}
- Intrusion Detected: ${securityStatus.intrusion}
- Cameras Recording: ${securityStatus.cameras.filter((c) => c.recording).length}/${securityStatus.cameras.length}
- Doors Locked: ${securityStatus.doors.filter((d) => d.locked).length}/${securityStatus.doors.length}
- Lights On: ${securityStatus.lights.filter((l) => l.on).length}/${securityStatus.lights.length}

Energy Data (if available):
${
  request.body.includes("energyData")
    ? `
- Current Power Usage: ${JSON.parse(await request.text()).energyData?.currentPower || "N/A"}W
- Daily Cost: $${JSON.parse(await request.text()).energyData?.cost || "N/A"}
- Solar Generation: ${JSON.parse(await request.text()).energyData?.solarGeneration || 0}W
- Battery Level: ${JSON.parse(await request.text()).energyData?.batteryLevel || "N/A"}%
`
    : ""
}

Recent Alerts: ${alerts.length > 0 ? alerts.map((a) => a.message).join(", ") : "None"}

Please provide:
1. Current home environment assessment
2. Security system status evaluation
3. Energy efficiency insights (if energy data available)
4. Specific recommendations for optimization
5. Any potential issues or concerns
6. Suggested automation improvements

Keep the response concise but informative, focusing on actionable insights.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const insights = response.text()

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("AI Insights Error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
