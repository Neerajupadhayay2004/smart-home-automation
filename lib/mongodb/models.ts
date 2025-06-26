import mongoose, { Schema, type Document } from "mongoose"

// Real-time data models for MongoDB (time-series data)

export interface IRealtimeData extends Document {
  homeId: string
  timestamp: Date
  data: {
    energy: {
      currentPower: number
      solarGeneration: number
      batteryLevel: number
      gridStatus: string
    }
    environment: {
      temperature: number
      humidity: number
      airQuality: number
      co2: number
      pressure: number
      uvIndex: number
    }
    security: {
      armed: boolean
      intrusion: boolean
      activeCameras: number
      lockedDoors: number
      lightsOn: number
    }
    network: {
      internetSpeed: number
      wifiStrength: number
      connectedDevices: number
      bandwidth: {
        upload: number
        download: number
        ping: number
      }
    }
    system: {
      cpuUsage: number
      memoryUsage: number
      diskUsage: number
      temperature: number
    }
  }
}

const RealtimeDataSchema = new Schema<IRealtimeData>(
  {
    homeId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    data: {
      energy: {
        currentPower: Number,
        solarGeneration: Number,
        batteryLevel: Number,
        gridStatus: String,
      },
      environment: {
        temperature: Number,
        humidity: Number,
        airQuality: Number,
        co2: Number,
        pressure: Number,
        uvIndex: Number,
      },
      security: {
        armed: Boolean,
        intrusion: Boolean,
        activeCameras: Number,
        lockedDoors: Number,
        lightsOn: Number,
      },
      network: {
        internetSpeed: Number,
        wifiStrength: Number,
        connectedDevices: Number,
        bandwidth: {
          upload: Number,
          download: Number,
          ping: Number,
        },
      },
      system: {
        cpuUsage: Number,
        memoryUsage: Number,
        diskUsage: Number,
        temperature: Number,
      },
    },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "homeId",
      granularity: "minutes",
    },
  },
)

// TTL index to automatically delete old data after 30 days
RealtimeDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

export interface IDeviceMetrics extends Document {
  deviceId: string
  homeId: string
  timestamp: Date
  metrics: {
    power?: number
    energy?: number
    temperature?: number
    humidity?: number
    batteryLevel?: number
    signalStrength?: number
    responseTime?: number
    errorCount?: number
    uptime?: number
  }
  status: "online" | "offline" | "error" | "maintenance"
}

const DeviceMetricsSchema = new Schema<IDeviceMetrics>(
  {
    deviceId: { type: String, required: true, index: true },
    homeId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    metrics: {
      power: Number,
      energy: Number,
      temperature: Number,
      humidity: Number,
      batteryLevel: Number,
      signalStrength: Number,
      responseTime: Number,
      errorCount: Number,
      uptime: Number,
    },
    status: {
      type: String,
      enum: ["online", "offline", "error", "maintenance"],
      default: "online",
    },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "deviceId",
      granularity: "seconds",
    },
  },
)

// TTL index for device metrics (7 days)
DeviceMetricsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 })

export interface IEnergyAnalytics extends Document {
  homeId: string
  date: Date
  hourlyData: Array<{
    hour: number
    consumption: number
    generation: number
    cost: number
    carbonFootprint: number
  }>
  dailyTotals: {
    totalConsumption: number
    totalGeneration: number
    totalCost: number
    totalCarbonFootprint: number
    peakPower: number
    averagePower: number
  }
  deviceBreakdown: Array<{
    deviceId: string
    deviceName: string
    consumption: number
    percentage: number
  }>
}

const EnergyAnalyticsSchema = new Schema<IEnergyAnalytics>({
  homeId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  hourlyData: [
    {
      hour: Number,
      consumption: Number,
      generation: Number,
      cost: Number,
      carbonFootprint: Number,
    },
  ],
  dailyTotals: {
    totalConsumption: Number,
    totalGeneration: Number,
    totalCost: Number,
    totalCarbonFootprint: Number,
    peakPower: Number,
    averagePower: Number,
  },
  deviceBreakdown: [
    {
      deviceId: String,
      deviceName: String,
      consumption: Number,
      percentage: Number,
    },
  ],
})

// Compound index for efficient queries
EnergyAnalyticsSchema.index({ homeId: 1, date: -1 })

export interface IAIInsight extends Document {
  homeId: string
  timestamp: Date
  type: "energy" | "security" | "comfort" | "maintenance" | "general"
  title: string
  description: string
  recommendations: string[]
  confidence: number
  priority: "low" | "medium" | "high" | "critical"
  metadata: any
  acknowledged: boolean
  acknowledgedAt?: Date
}

const AIInsightSchema = new Schema<IAIInsight>({
  homeId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  type: {
    type: String,
    enum: ["energy", "security", "comfort", "maintenance", "general"],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  recommendations: [String],
  confidence: { type: Number, min: 0, max: 1 },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  metadata: Schema.Types.Mixed,
  acknowledged: { type: Boolean, default: false },
  acknowledgedAt: Date,
})

// TTL index for AI insights (90 days)
AIInsightSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

// Export models
export const RealtimeData =
  mongoose.models.RealtimeData || mongoose.model<IRealtimeData>("RealtimeData", RealtimeDataSchema)
export const DeviceMetrics =
  mongoose.models.DeviceMetrics || mongoose.model<IDeviceMetrics>("DeviceMetrics", DeviceMetricsSchema)
export const EnergyAnalytics =
  mongoose.models.EnergyAnalytics || mongoose.model<IEnergyAnalytics>("EnergyAnalytics", EnergyAnalyticsSchema)
export const AIInsight = mongoose.models.AIInsight || mongoose.model<IAIInsight>("AIInsight", AIInsightSchema)
