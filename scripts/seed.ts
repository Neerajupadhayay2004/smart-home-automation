import { PrismaClient } from "@prisma/client"
import { dataService } from "../lib/services/data-service"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create a demo user
  const user = await dataService.createUser({
    email: "demo@smarthome.com",
    name: "Demo User",
    role: "ADMIN",
  })

  console.log("✅ Created demo user:", user.email)

  // Create a demo home
  const home = await dataService.createHome({
    name: "Smart Demo Home",
    address: "123 Smart Street, Tech City, TC 12345",
    timezone: "America/New_York",
    ownerId: user.id,
  })

  console.log("✅ Created demo home:", home.name)

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: "Living Room",
        type: "LIVING_ROOM",
        floor: 1,
        homeId: home.id,
      },
    }),
    prisma.room.create({
      data: {
        name: "Master Bedroom",
        type: "BEDROOM",
        floor: 2,
        homeId: home.id,
      },
    }),
    prisma.room.create({
      data: {
        name: "Kitchen",
        type: "KITCHEN",
        floor: 1,
        homeId: home.id,
      },
    }),
    prisma.room.create({
      data: {
        name: "Garage",
        type: "GARAGE",
        floor: 1,
        homeId: home.id,
      },
    }),
  ])

  console.log("✅ Created rooms:", rooms.map((r) => r.name).join(", "))

  // Create devices
  const devices = await Promise.all([
    dataService.addDevice({
      name: "Front Door Camera",
      type: "SECURITY_CAMERA",
      category: "SECURITY",
      homeId: home.id,
      manufacturer: "SmartCam",
      model: "SC-4K-Pro",
      macAddress: "00:11:22:33:44:55",
      ipAddress: "192.168.1.100",
      capabilities: ["recording", "night_vision", "ai_detection", "two_way_audio"],
    }),
    dataService.addDevice({
      name: "Smart Thermostat",
      type: "THERMOSTAT",
      category: "CLIMATE",
      homeId: home.id,
      roomId: rooms[0].id, // Living Room
      manufacturer: "EcoSmart",
      model: "ES-T300",
      capabilities: ["temperature_control", "humidity_sensing", "scheduling", "geofencing"],
    }),
    dataService.addDevice({
      name: "Smart Door Lock",
      type: "DOOR_LOCK",
      category: "SECURITY",
      homeId: home.id,
      manufacturer: "SecureTech",
      model: "ST-Lock-Pro",
      capabilities: ["keypad", "biometric", "remote_unlock", "access_logs"],
    }),
    dataService.addDevice({
      name: "Living Room Lights",
      type: "SMART_LIGHT",
      category: "LIGHTING",
      homeId: home.id,
      roomId: rooms[0].id,
      manufacturer: "BrightHome",
      model: "BH-LED-Strip",
      capabilities: ["dimming", "color_changing", "scheduling", "motion_sensing"],
    }),
    dataService.addDevice({
      name: "Energy Monitor",
      type: "SMART_METER",
      category: "ENERGY",
      homeId: home.id,
      manufacturer: "PowerTrack",
      model: "PT-Monitor-Pro",
      capabilities: ["real_time_monitoring", "solar_tracking", "cost_analysis", "alerts"],
    }),
  ])

  console.log("✅ Created devices:", devices.map((d) => d.name).join(", "))

  // Create sensors for devices
  const sensors = await Promise.all([
    // Thermostat sensors
    prisma.sensor.create({
      data: {
        name: "Temperature Sensor",
        type: "TEMPERATURE",
        unit: "°C",
        minValue: -20,
        maxValue: 50,
        accuracy: 0.1,
        deviceId: devices[1].id, // Thermostat
        roomId: rooms[0].id,
      },
    }),
    prisma.sensor.create({
      data: {
        name: "Humidity Sensor",
        type: "HUMIDITY",
        unit: "%",
        minValue: 0,
        maxValue: 100,
        accuracy: 1,
        deviceId: devices[1].id, // Thermostat
        roomId: rooms[0].id,
      },
    }),
    // Motion sensor for camera
    prisma.sensor.create({
      data: {
        name: "Motion Detector",
        type: "MOTION",
        unit: "boolean",
        batteryLevel: 85,
        deviceId: devices[0].id, // Camera
      },
    }),
    // Door sensor for lock
    prisma.sensor.create({
      data: {
        name: "Door Position Sensor",
        type: "DOOR_WINDOW",
        unit: "boolean",
        batteryLevel: 92,
        deviceId: devices[2].id, // Door Lock
      },
    }),
  ])

  console.log("✅ Created sensors:", sensors.map((s) => s.name).join(", "))

  // Create automation rules
  const automationRules = await Promise.all([
    dataService.createAutomationRule({
      name: "Evening Security",
      description: "Arm security system and turn on outdoor lights at sunset",
      homeId: home.id,
      triggers: {
        type: "time",
        condition: "sunset",
      },
      actions: {
        security: { armed: true },
        lights: { outdoor: { on: true, brightness: 80 } },
      },
      priority: 1,
    }),
    dataService.createAutomationRule({
      name: "Energy Saver",
      description: "Reduce HVAC during peak hours when nobody is home",
      homeId: home.id,
      triggers: {
        type: "composite",
        conditions: [
          { type: "time", condition: "peak_hours" },
          { type: "occupancy", condition: "nobody_home" },
        ],
      },
      actions: {
        hvac: { mode: "eco", temperature_offset: 2 },
      },
      priority: 2,
    }),
    dataService.createAutomationRule({
      name: "Good Morning",
      description: "Gradually increase lights and start coffee maker",
      homeId: home.id,
      triggers: {
        type: "time",
        condition: "weekday_6am",
      },
      actions: {
        lights: { gradual_on: true, duration: 300 },
        appliances: { coffee_maker: "start" },
      },
      schedule: {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        time: "06:00",
      },
      priority: 3,
    }),
  ])

  console.log("✅ Created automation rules:", automationRules.map((r) => r.name).join(", "))

  // Create some sample security events
  const securityEvents = await Promise.all([
    dataService.createSecurityEvent({
      type: "MOTION_DETECTED",
      severity: "LOW",
      title: "Motion Detected",
      description: "Motion detected at front door - Package delivery identified",
      homeId: home.id,
      deviceId: devices[0].id, // Camera
      metadata: {
        confidence: 0.98,
        object_detected: "person",
        delivery_detected: true,
      },
    }),
    dataService.createSecurityEvent({
      type: "ACCESS_GRANTED",
      severity: "LOW",
      title: "Door Unlocked",
      description: "Front door unlocked using keypad",
      homeId: home.id,
      deviceId: devices[2].id, // Door Lock
      metadata: {
        access_method: "keypad",
        user_code: "****",
      },
    }),
  ])

  console.log("✅ Created security events:", securityEvents.map((e) => e.title).join(", "))

  // Create sample real-time data
  const sampleRealtimeData = {
    energy: {
      currentPower: 3850,
      solarGeneration: 1450,
      batteryLevel: 78,
      gridStatus: "connected",
    },
    environment: {
      temperature: 22.8,
      humidity: 42,
      airQuality: 85,
      co2: 415,
      pressure: 1013.8,
      uvIndex: 4,
    },
    security: {
      armed: true,
      intrusion: false,
      activeCameras: 4,
      lockedDoors: 3,
      lightsOn: 2,
    },
    network: {
      internetSpeed: 185.5,
      wifiStrength: 94,
      connectedDevices: 47,
      bandwidth: {
        upload: 25.8,
        download: 185.5,
        ping: 12,
      },
    },
    system: {
      cpuUsage: 28,
      memoryUsage: 45,
      diskUsage: 62,
      temperature: 42,
    },
  }

  await dataService.saveRealtimeData(home.id, sampleRealtimeData)
  console.log("✅ Created sample real-time data")

  // Create sample AI insights
  const aiInsights = await Promise.all([
    dataService.saveAIInsight({
      homeId: home.id,
      type: "energy",
      title: "Energy Optimization Opportunity",
      description: "Your HVAC system is consuming 35% more energy than optimal during peak hours.",
      recommendations: [
        "Schedule HVAC to pre-cool during off-peak hours",
        "Install smart blinds to reduce solar heat gain",
        "Consider upgrading to a variable-speed heat pump",
      ],
      confidence: 0.92,
      priority: "medium",
      metadata: {
        potential_savings: 24.5,
        current_efficiency: 78,
        optimal_efficiency: 92,
      },
    }),
    dataService.saveAIInsight({
      homeId: home.id,
      type: "security",
      title: "Security Pattern Analysis",
      description: "Unusual activity detected: Front door accessed 3 times between 2-4 AM this week.",
      recommendations: [
        "Review access logs for unauthorized entries",
        "Enable motion alerts for nighttime hours",
        "Consider adding additional security cameras",
      ],
      confidence: 0.87,
      priority: "high",
      metadata: {
        pattern_detected: "unusual_access_times",
        frequency: 3,
        time_range: "02:00-04:00",
      },
    }),
    dataService.saveAIInsight({
      homeId: home.id,
      type: "comfort",
      title: "Climate Comfort Optimization",
      description: "Temperature variations detected in master bedroom affecting sleep quality.",
      recommendations: [
        "Install a smart vent in the master bedroom",
        "Adjust HVAC zoning for better temperature control",
        "Consider a bedroom-specific temperature sensor",
      ],
      confidence: 0.84,
      priority: "low",
      metadata: {
        temperature_variance: 3.2,
        affected_room: "master_bedroom",
        sleep_impact_score: 0.73,
      },
    }),
  ])

  console.log("✅ Created AI insights:", aiInsights.map((i) => i.title).join(", "))

  // Create sample energy analytics
  const today = new Date()
  const energyAnalytics = await dataService.saveEnergyAnalytics(home.id, today, {
    hourlyData: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      consumption: 2.5 + Math.random() * 2,
      generation: hour >= 6 && hour <= 18 ? Math.random() * 3 : 0,
      cost: (2.5 + Math.random() * 2) * 0.12,
      carbonFootprint: (2.5 + Math.random() * 2) * 0.4,
    })),
    dailyTotals: {
      totalConsumption: 32.5,
      totalGeneration: 18.2,
      totalCost: 5.67,
      totalCarbonFootprint: 13.8,
      peakPower: 4.2,
      averagePower: 2.8,
    },
    deviceBreakdown: [
      { deviceId: devices[1].id, deviceName: "Smart Thermostat", consumption: 12.5, percentage: 38.5 },
      { deviceId: devices[3].id, deviceName: "Living Room Lights", consumption: 3.2, percentage: 9.8 },
      { deviceId: devices[0].id, deviceName: "Front Door Camera", consumption: 1.8, percentage: 5.5 },
    ],
  })

  console.log("✅ Created energy analytics for today")

  // Log activities
  await Promise.all([
    dataService.logActivity({
      type: "LOGIN",
      title: "User Login",
      description: "Demo user logged into the system",
      userId: user.id,
      metadata: { ip_address: "192.168.1.50", user_agent: "Smart Home App" },
    }),
    dataService.logActivity({
      type: "DEVICE_CONTROLLED",
      title: "Lights Controlled",
      description: "Living room lights turned on via mobile app",
      userId: user.id,
      metadata: { device_id: devices[3].id, action: "turn_on", brightness: 80 },
    }),
    dataService.logActivity({
      type: "AUTOMATION_CREATED",
      title: "Automation Rule Created",
      description: 'Created "Evening Security" automation rule',
      userId: user.id,
      metadata: { rule_id: automationRules[0].id, rule_name: "Evening Security" },
    }),
  ])

  console.log("✅ Created sample activities")

  console.log("🎉 Database seeding completed successfully!")
  console.log(`
📊 Summary:
- Users: 1
- Homes: 1
- Rooms: ${rooms.length}
- Devices: ${devices.length}
- Sensors: ${sensors.length}
- Automation Rules: ${automationRules.length}
- Security Events: ${securityEvents.length}
- AI Insights: ${aiInsights.length}
- Real-time Data: 1 record
- Energy Analytics: 1 day
- Activities: 3 records
  `)
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
