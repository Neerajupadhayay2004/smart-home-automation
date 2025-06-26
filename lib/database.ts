import { PrismaClient } from "@prisma/client"
import mongoose from "mongoose"

// PostgreSQL connection with Prisma
declare global {
  var prismaClient: PrismaClient | undefined
}

export const prisma = globalThis.prismaClient || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prisma
}

// MongoDB connection with Mongoose
let isConnected = false

export const connectMongoDB = async () => {
  if (isConnected) {
    return
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: "smarthome",
    })
    isConnected = true
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    // Check PostgreSQL
    await prisma.$queryRaw`SELECT 1`

    // Check MongoDB
    if (mongoose.connection.readyState !== 1) {
      await connectMongoDB()
    }

    return {
      postgresql: "healthy",
      mongodb: "healthy",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Database health check failed:", error)
    return {
      postgresql: "error",
      mongodb: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}
