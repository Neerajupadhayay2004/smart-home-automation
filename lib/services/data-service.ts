import { prisma } from "@/lib/database"
import { connectMongoDB, RealtimeData, DeviceMetrics, EnergyAnalytics, AIInsight } from "@/lib/mongodb/models"

export class DataService {
  // PostgreSQL operations for structured data

  async createUser(data: {
    email: string
    name: string
    role?: "ADMIN" | "USER" | "GUEST"
  }) {
    return await prisma.user.create({
      data: {
        ...data,
        role: data.role || "USER",
      },
    })
  }

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        homes: {
          include: {
            devices: true,
            rooms: true,
          },
        },
      },
    })
  }

  async createHome(data: {
    name: string
    address?: string
    timezone?: string
    ownerId: string
  }) {
    return await prisma.home.create({
      data: {
        ...data,
        timezone: data.timezone || "UTC",
      },
    })
  }

  async addDevice(data: {
    name: string
    type: string
    category: string
    homeId: string
    roomId?: string
    manufacturer?: string
    model?: string
    macAddress?: string
    ipAddress?: string
    settings?: any
    capabilities?: string[]
  }) {
    return await prisma.device.create({
      data: {
        ...data,
        type: data.type as any,
        category: data.category as any,
        status: "OFFLINE",
      },
    })
  }

  async updateDeviceStatus(deviceId: string, status: "ONLINE" | "OFFLINE" | "ERROR" | "UPDATING" | "MAINTENANCE") {
    return await prisma.device.update({
      where: { id: deviceId },
      data: {
        status,
        isOnline: status === "ONLINE",
        lastSeen: new Date(),
      },
    })
  }

  async createSecurityEvent(data: {
    type: string
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    title: string
    description: string
    homeId: string
    deviceId?: string
    metadata?: any
  }) {
    return await prisma.securityEvent.create({
      data: {
        ...data,
        type: data.type as any,
        severity: data.severity as any,
      },
    })
  }

  async createAutomationRule(data: {
    name: string
    description?: string
    homeId: string
    triggers: any
    conditions?: any
    actions: any
    schedule?: any
    priority?: number
  }) {
    return await prisma.automationRule.create({
      data: {
        ...data,
        priority: data.priority || 0,
      },
    })
  }

  async executeAutomationRule(ruleId: string, success: boolean, duration?: number, error?: string, metadata?: any) {
    // Update rule execution count and last triggered
    await prisma.automationRule.update({
      where: { id: ruleId },
      data: {
        lastTriggered: new Date(),
        executions: {
          increment: 1,
        },
      },
    })

    // Log execution
    return await prisma.automationExecution.create({
      data: {
        ruleId,
        success,
        duration,
        error,
        metadata,
      },
    })
  }

  async logActivity(data: {
    type: string
    title: string
    description?: string
    userId: string
    metadata?: any
  }) {
    return await prisma.activity.create({
      data: {
        ...data,
        type: data.type as any,
      },
    })
  }

  // MongoDB operations for time-series data

  async saveRealtimeData(homeId: string, data: any) {
    await connectMongoDB()

    const realtimeData = new RealtimeData({
      homeId,
      timestamp: new Date(),
      data,
    })

    return await realtimeData.save()
  }

  async getRealtimeData(homeId: string, hours = 24) {
    await connectMongoDB()

    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000)

    return await RealtimeData.find({
      homeId,
      timestamp: { $gte: startTime },
    })
      .sort({ timestamp: -1 })
      .limit(1000)
  }

  async saveDeviceMetrics(deviceId: string, homeId: string, metrics: any, status: string) {
    await connectMongoDB()

    const deviceMetrics = new DeviceMetrics({
      deviceId,
      homeId,
      timestamp: new Date(),
      metrics,
      status: status as any,
    })

    return await deviceMetrics.save()
  }

  async getDeviceMetrics(deviceId: string, hours = 24) {
    await connectMongoDB()

    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000)

    return await DeviceMetrics.find({
      deviceId,
      timestamp: { $gte: startTime },
    })
      .sort({ timestamp: -1 })
      .limit(1000)
  }

  async saveEnergyAnalytics(homeId: string, date: Date, data: any) {
    await connectMongoDB()

    return await EnergyAnalytics.findOneAndUpdate({ homeId, date }, { ...data }, { upsert: true, new: true })
  }

  async getEnergyAnalytics(homeId: string, days = 30) {
    await connectMongoDB()

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    return await EnergyAnalytics.find({
      homeId,
      date: { $gte: startDate },
    }).sort({ date: -1 })
  }

  async saveAIInsight(data: {
    homeId: string
    type: "energy" | "security" | "comfort" | "maintenance" | "general"
    title: string
    description: string
    recommendations: string[]
    confidence: number
    priority: "low" | "medium" | "high" | "critical"
    metadata?: any
  }) {
    await connectMongoDB()

    const insight = new AIInsight(data)
    return await insight.save()
  }

  async getAIInsights(homeId: string, limit = 50) {
    await connectMongoDB()

    return await AIInsight.find({ homeId }).sort({ timestamp: -1 }).limit(limit)
  }

  async acknowledgeAIInsight(insightId: string) {
    await connectMongoDB()

    return await AIInsight.findByIdAndUpdate(
      insightId,
      {
        acknowledged: true,
        acknowledgedAt: new Date(),
      },
      { new: true },
    )
  }

  // Analytics and aggregation methods

  async getEnergyTrends(homeId: string, period: "day" | "week" | "month" = "week") {
    await connectMongoDB()

    const now = new Date()
    let startDate: Date
    let groupBy: any

    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        groupBy = {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          day: { $dayOfMonth: "$timestamp" },
          hour: { $hour: "$timestamp" },
        }
        break
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        groupBy = {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          day: { $dayOfMonth: "$timestamp" },
        }
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        groupBy = {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          week: { $week: "$timestamp" },
        }
        break
    }

    return await RealtimeData.aggregate([
      {
        $match: {
          homeId,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          avgPower: { $avg: "$data.energy.currentPower" },
          maxPower: { $max: "$data.energy.currentPower" },
          minPower: { $min: "$data.energy.currentPower" },
          avgSolar: { $avg: "$data.energy.solarGeneration" },
          avgBattery: { $avg: "$data.energy.batteryLevel" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 },
      },
    ])
  }

  async getDeviceHealthSummary(homeId: string) {
    const devices = await prisma.device.findMany({
      where: { homeId },
      include: {
        sensors: {
          include: {
            readings: {
              take: 1,
              orderBy: { timestamp: "desc" },
            },
          },
        },
        energyReadings: {
          take: 1,
          orderBy: { timestamp: "desc" },
        },
      },
    })

    return devices.map((device) => ({
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      isOnline: device.isOnline,
      lastSeen: device.lastSeen,
      sensorCount: device.sensors.length,
      hasRecentData: device.sensors.some(
        (sensor) =>
          sensor.readings.length > 0 && new Date(sensor.readings[0].timestamp).getTime() > Date.now() - 5 * 60 * 1000,
      ),
    }))
  }

  // Cleanup methods

  async cleanupOldData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Clean up old sensor readings (keep only last 7 days)
    await prisma.sensorReading.deleteMany({
      where: {
        timestamp: {
          lt: sevenDaysAgo,
        },
      },
    })

    // Clean up old energy readings (keep only last 30 days)
    await prisma.energyReading.deleteMany({
      where: {
        timestamp: {
          lt: thirtyDaysAgo,
        },
      },
    })

    // Clean up resolved security events older than 30 days
    await prisma.securityEvent.deleteMany({
      where: {
        resolved: true,
        resolvedAt: {
          lt: thirtyDaysAgo,
        },
      },
    })

    // Clean up old automation executions (keep only last 30 days)
    await prisma.automationExecution.deleteMany({
      where: {
        timestamp: {
          lt: thirtyDaysAgo,
        },
      },
    })

    console.log("Database cleanup completed")
  }
}

export const dataService = new DataService()
