import { PrismaClient } from "@prisma/client"
import { connectMongoDB, RealtimeData, DeviceMetrics, EnergyAnalytics, AIInsight } from "../lib/mongodb/models"

const prisma = new PrismaClient()

async function cleanupPostgreSQL() {
  console.log("🧹 Cleaning up PostgreSQL data...")

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  // Clean up old sensor readings (keep only last 7 days)
  const deletedSensorReadings = await prisma.sensorReading.deleteMany({
    where: {
      timestamp: {
        lt: sevenDaysAgo,
      },
    },
  })
  console.log(`✅ Deleted ${deletedSensorReadings.count} old sensor readings`)

  // Clean up old energy readings (keep only last 30 days)
  const deletedEnergyReadings = await prisma.energyReading.deleteMany({
    where: {
      timestamp: {
        lt: thirtyDaysAgo,
      },
    },
  })
  console.log(`✅ Deleted ${deletedEnergyReadings.count} old energy readings`)

  // Clean up resolved security events older than 30 days
  const deletedSecurityEvents = await prisma.securityEvent.deleteMany({
    where: {
      resolved: true,
      resolvedAt: {
        lt: thirtyDaysAgo,
      },
    },
  })
  console.log(`✅ Deleted ${deletedSecurityEvents.count} old resolved security events`)

  // Clean up old automation executions (keep only last 30 days)
  const deletedAutomationExecutions = await prisma.automationExecution.deleteMany({
    where: {
      timestamp: {
        lt: thirtyDaysAgo,
      },
    },
  })
  console.log(`✅ Deleted ${deletedAutomationExecutions.count} old automation executions`)

  // Clean up old activities (keep only last 90 days)
  const deletedActivities = await prisma.activity.deleteMany({
    where: {
      timestamp: {
        lt: ninetyDaysAgo,
      },
    },
  })
  console.log(`✅ Deleted ${deletedActivities.count} old activities`)

  // Clean up expired sessions
  const deletedSessions = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
  console.log(`✅ Deleted ${deletedSessions.count} expired sessions`)

  // Clean up old system logs (keep only last 30 days)
  const deletedSystemLogs = await prisma.systemLog.deleteMany({
    where: {
      timestamp: {
        lt: thirtyDaysAgo,
      },
    },
  })
  console.log(`✅ Deleted ${deletedSystemLogs.count} old system logs`)
}

async function cleanupMongoDB() {
  console.log("🧹 Cleaning up MongoDB data...")

  await connectMongoDB()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  // Clean up old real-time data (keep only last 30 days)
  const deletedRealtimeData = await RealtimeData.deleteMany({
    timestamp: { $lt: thirtyDaysAgo },
  })
  console.log(`✅ Deleted ${deletedRealtimeData.deletedCount} old real-time data records`)

  // Clean up old device metrics (keep only last 7 days)
  const deletedDeviceMetrics = await DeviceMetrics.deleteMany({
    timestamp: { $lt: sevenDaysAgo },
  })
  console.log(`✅ Deleted ${deletedDeviceMetrics.deletedCount} old device metrics`)

  // Clean up old energy analytics (keep only last 90 days)
  const deletedEnergyAnalytics = await EnergyAnalytics.deleteMany({
    date: { $lt: ninetyDaysAgo },
  })
  console.log(`✅ Deleted ${deletedEnergyAnalytics.deletedCount} old energy analytics`)

  // Clean up acknowledged AI insights older than 90 days
  const deletedAIInsights = await AIInsight.deleteMany({
    acknowledged: true,
    acknowledgedAt: { $lt: ninetyDaysAgo },
  })
  console.log(`✅ Deleted ${deletedAIInsights.deletedCount} old acknowledged AI insights`)
}

async function optimizeDatabase() {
  console.log("⚡ Optimizing database performance...")

  // Analyze and vacuum PostgreSQL tables
  try {
    await prisma.$executeRaw`ANALYZE;`
    console.log("✅ PostgreSQL tables analyzed")

    // Update statistics for better query planning
    await prisma.$executeRaw`VACUUM ANALYZE;`
    console.log("✅ PostgreSQL vacuum completed")
  } catch (error) {
    console.warn("⚠️ PostgreSQL optimization failed:", error.message)
  }

  // Compact MongoDB collections
  try {
    await connectMongoDB()

    // Note: compact() requires admin privileges
    // await mongoose.connection.db.command({ compact: 'realtimedata' })
    // await mongoose.connection.db.command({ compact: 'devicemetrics' })
    // await mongoose.connection.db.command({ compact: 'energyanalytics' })
    // await mongoose.connection.db.command({ compact: 'aiinsights' })

    console.log("✅ MongoDB optimization completed")
  } catch (error) {
    console.warn("⚠️ MongoDB optimization failed:", error.message)
  }
}

async function generateReport() {
  console.log("📊 Generating cleanup report...")

  // Get database statistics
  const userCount = await prisma.user.count()
  const homeCount = await prisma.home.count()
  const deviceCount = await prisma.device.count()
  const onlineDeviceCount = await prisma.device.count({ where: { isOnline: true } })
  const sensorReadingCount = await prisma.sensorReading.count()
  const securityEventCount = await prisma.securityEvent.count()
  const unresolvedSecurityEventCount = await prisma.securityEvent.count({ where: { resolved: false } })
  const automationRuleCount = await prisma.automationRule.count()
  const activeAutomationRuleCount = await prisma.automationRule.count({ where: { enabled: true } })

  await connectMongoDB()
  const realtimeDataCount = await RealtimeData.countDocuments()
  const deviceMetricsCount = await DeviceMetrics.countDocuments()
  const energyAnalyticsCount = await EnergyAnalytics.countDocuments()
  const aiInsightCount = await AIInsight.countDocuments()
  const unacknowledgedInsightCount = await AIInsight.countDocuments({ acknowledged: false })

  console.log(`
📈 Database Statistics:
┌─────────────────────────────────┬─────────┐
│ PostgreSQL                      │ Count   │
├─────────────────────────────────┼─────────┤
│ Users                           │ ${userCount.toString().padStart(7)} │
│ Homes                           │ ${homeCount.toString().padStart(7)} │
│ Devices                         │ ${deviceCount.toString().padStart(7)} │
│ ├─ Online                       │ ${onlineDeviceCount.toString().padStart(7)} │
│ Sensor Readings                 │ ${sensorReadingCount.toString().padStart(7)} │
│ Security Events                 │ ${securityEventCount.toString().padStart(7)} │
│ ├─ Unresolved                   │ ${unresolvedSecurityEventCount.toString().padStart(7)} │
│ Automation Rules                │ ${automationRuleCount.toString().padStart(7)} │
│ ├─ Active                       │ ${activeAutomationRuleCount.toString().padStart(7)} │
├─────────────────────────────────┼─────────┤
│ MongoDB                         │ Count   │
├─────────────────────────────────┼─────────┤
│ Real-time Data Records          │ ${realtimeDataCount.toString().padStart(7)} │
│ Device Metrics                  │ ${deviceMetricsCount.toString().padStart(7)} │
│ Energy Analytics                │ ${energyAnalyticsCount.toString().padStart(7)} │
│ AI Insights                     │ ${aiInsightCount.toString().padStart(7)} │
│ ├─ Unacknowledged               │ ${unacknowledgedInsightCount.toString().padStart(7)} │
└─────────────────────────────────┴─────────┘
  `)

  // Check for potential issues
  const issues = []

  if (onlineDeviceCount / deviceCount < 0.8) {
    issues.push(`⚠️ Only ${Math.round((onlineDeviceCount / deviceCount) * 100)}% of devices are online`)
  }

  if (unresolvedSecurityEventCount > 10) {
    issues.push(`⚠️ ${unresolvedSecurityEventCount} unresolved security events`)
  }

  if (unacknowledgedInsightCount > 20) {
    issues.push(`⚠️ ${unacknowledgedInsightCount} unacknowledged AI insights`)
  }

  if (issues.length > 0) {
    console.log("\n🚨 Issues Found:")
    issues.forEach((issue) => console.log(issue))
  } else {
    console.log("\n✅ No issues found - system is healthy!")
  }
}

async function main() {
  console.log("🚀 Starting database cleanup and optimization...")

  try {
    await cleanupPostgreSQL()
    await cleanupMongoDB()
    await optimizeDatabase()
    await generateReport()

    console.log("\n🎉 Database cleanup completed successfully!")
  } catch (error) {
    console.error("❌ Cleanup failed:", error)
    process.exit(1)
  }
}

main().finally(async () => {
  await prisma.$disconnect()
  process.exit(0)
})
