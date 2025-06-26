import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/database"

export async function GET() {
  try {
    const health = await checkDatabaseHealth()

    return NextResponse.json({
      status: "success",
      health,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        error: "Database health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
