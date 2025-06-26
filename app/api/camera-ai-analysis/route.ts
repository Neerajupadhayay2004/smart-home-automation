import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI("AIzaSyCF0864FdCMZWgEXiN8uzMpyQTfiuo2uug")

export async function POST(request: NextRequest) {
  try {
    const { cameraId, detectionType, confidence, timestamp, location, imageData } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

    const prompt = `
    As an advanced AI security system, analyze this camera detection event:

    Camera: ${cameraId}
    Location: ${location}
    Detection Type: ${detectionType}
    AI Confidence: ${confidence}%
    Timestamp: ${timestamp}
    
    Provide detailed analysis including:
    1. Threat assessment (None/Low/Medium/High/Critical)
    2. Recommended immediate actions
    3. Alert priority level
    4. Additional monitoring suggestions
    5. Context-aware security recommendations
    6. False positive likelihood assessment
    
    Consider factors like:
    - Time of day
    - Location context
    - Detection confidence level
    - Historical patterns
    - Environmental conditions
    
    Keep response structured and actionable.
    `

    const result = await genAI.generateContent(prompt)
    const response = await result.response
    const analysis = response.text()

    // Determine alert level based on detection type and confidence
    let alertLevel = "low"
    let threatScore = 0

    if (detectionType.toLowerCase().includes("person")) {
      threatScore += confidence > 90 ? 30 : confidence > 70 ? 20 : 10
    }
    if (detectionType.toLowerCase().includes("intrusion") || detectionType.toLowerCase().includes("break")) {
      threatScore += 50
    }
    if (detectionType.toLowerCase().includes("weapon") || detectionType.toLowerCase().includes("emergency")) {
      threatScore += 80
    }
    if (detectionType.toLowerCase().includes("vehicle")) {
      threatScore += confidence > 85 ? 25 : 15
    }

    // Time-based adjustments
    const hour = new Date().getHours()
    if (hour >= 22 || hour <= 6) threatScore += 15 // Night time bonus
    if (hour >= 9 && hour <= 17) threatScore -= 10 // Daytime reduction

    if (threatScore >= 70) alertLevel = "critical"
    else if (threatScore >= 50) alertLevel = "high"
    else if (threatScore >= 30) alertLevel = "medium"

    return NextResponse.json({
      analysis,
      alertLevel,
      confidence,
      threatScore,
      timestamp: new Date().toISOString(),
      recommendations: analysis
        .split("\n")
        .filter(
          (line) => line.includes("Recommend") || line.includes("Action") || line.includes("•") || line.includes("-"),
        )
        .slice(0, 5),
      contextualInfo: {
        timeOfDay: hour >= 22 || hour <= 6 ? "night" : hour >= 6 && hour <= 18 ? "day" : "evening",
        locationRisk: location.toLowerCase().includes("door") ? "high" : "medium",
        confidenceLevel: confidence >= 90 ? "very_high" : confidence >= 70 ? "high" : "medium",
      },
    })
  } catch (error) {
    console.error("Camera AI Analysis Error:", error)
    return NextResponse.json(
      {
        analysis: "AI camera analysis temporarily unavailable. Manual review recommended for security event.",
        alertLevel: "medium",
        confidence: 0,
        threatScore: 25,
        timestamp: new Date().toISOString(),
        recommendations: [
          "Manual security review required",
          "Check camera feed directly",
          "Verify with additional sensors",
          "Consider contacting security service",
          "Review recent activity logs",
        ],
        contextualInfo: {
          timeOfDay: "unknown",
          locationRisk: "medium",
          confidenceLevel: "low",
        },
      },
      { status: 200 },
    )
  }
}
