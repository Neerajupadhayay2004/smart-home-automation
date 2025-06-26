import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `You are an advanced AI assistant for a smart home automation system. Analyze the following data and provide comprehensive insights and recommendations:

Environment Data: ${JSON.stringify(data.environmentalData)}
Security Status: ${JSON.stringify(data.securityStatus)}
Energy Data: ${JSON.stringify(data.energyData)}
System Health: ${JSON.stringify(data.systemHealth)}
Current Alerts: ${JSON.stringify(data.alerts)}
Time of Day: ${data.timeOfDay}

Please provide:
1. Overall system status assessment
2. Security insights and recommendations
3. Energy optimization suggestions
4. Climate control recommendations
5. Automation suggestions
6. Predictive insights for the next 24 hours
7. Any potential issues or maintenance needs

Format your response as a comprehensive smart home intelligence report with clear sections and actionable recommendations.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const insights = response.text()

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("AI Insights API Error:", error)
    return NextResponse.json({ error: "Failed to generate AI insights" }, { status: 500 })
  }
}
