import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI("AIzaSyCF0864FdCMZWgEXiN8uzMpyQTfiuo2uug")

export async function POST(request: NextRequest) {
  try {
    const { command, context, deviceStates } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
    As a smart home voice control AI, interpret the following voice command and provide appropriate actions:

    Voice Command: "${command}"
    
    Current Context:
    ${JSON.stringify(context, null, 2)}

    Available Device States:
    ${JSON.stringify(deviceStates, null, 2)}

    Please provide:
    1. Command interpretation and intent
    2. Specific device actions to execute
    3. Confirmation message for the user
    4. Any clarifications needed
    5. Safety considerations
    6. Alternative suggestions if command is unclear

    Supported commands include:
    - Lighting control (on/off/dim/brighten)
    - Temperature adjustment
    - Security system control
    - Device power management
    - Scene activation
    - Information queries

    Format response as JSON with clear action items and user feedback.
    `

    const result = await genAI.generateContent(prompt)
    const response = await result.response
    const interpretation = response.text()

    // Parse command for common patterns
    const lowerCommand = command.toLowerCase()
    const actions = []
    let confirmationMessage = ""
    let needsClarification = false

    if (lowerCommand.includes("turn on") || lowerCommand.includes("switch on")) {
      if (lowerCommand.includes("lights") || lowerCommand.includes("light")) {
        actions.push({ type: "light_control", action: "on", target: "all" })
        confirmationMessage = "Turning on all lights"
      } else if (lowerCommand.includes("security") || lowerCommand.includes("alarm")) {
        actions.push({ type: "security_control", action: "arm", target: "system" })
        confirmationMessage = "Arming security system"
      }
    } else if (lowerCommand.includes("turn off") || lowerCommand.includes("switch off")) {
      if (lowerCommand.includes("lights") || lowerCommand.includes("light")) {
        actions.push({ type: "light_control", action: "off", target: "all" })
        confirmationMessage = "Turning off all lights"
      }
    } else if (lowerCommand.includes("temperature") || lowerCommand.includes("thermostat")) {
      const tempMatch = lowerCommand.match(/(\d+)\s*degrees?/)
      if (tempMatch) {
        actions.push({ type: "climate_control", action: "set_temperature", value: Number.parseInt(tempMatch[1]) })
        confirmationMessage = `Setting temperature to ${tempMatch[1]} degrees`
      } else {
        needsClarification = true
        confirmationMessage = "What temperature would you like to set?"
      }
    } else if (lowerCommand.includes("lock") || lowerCommand.includes("unlock")) {
      const action = lowerCommand.includes("unlock") ? "unlock" : "lock"
      actions.push({ type: "door_control", action, target: "all" })
      confirmationMessage = `${action === "lock" ? "Locking" : "Unlocking"} all doors`
    } else {
      needsClarification = true
      confirmationMessage = "I didn't understand that command. Could you please rephrase?"
    }

    return NextResponse.json({
      interpretation,
      intent: actions.length > 0 ? actions[0].type : "unknown",
      actions,
      confirmationMessage,
      needsClarification,
      confidence: actions.length > 0 ? 85 : 30,
      suggestedCommands: [
        "Turn on the lights",
        "Set temperature to 22 degrees",
        "Lock all doors",
        "Arm security system",
        "Turn off all devices",
      ],
    })
  } catch (error) {
    console.error("Voice Control Error:", error)
    return NextResponse.json(
      {
        interpretation: "Voice control service temporarily unavailable",
        intent: "error",
        actions: [],
        confirmationMessage: "Sorry, I couldn't process that command right now",
        needsClarification: false,
        confidence: 0,
        suggestedCommands: [],
      },
      { status: 200 },
    )
  }
}
