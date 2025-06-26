import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useSmartHome } from "../context/SmartHomeContext"
import StatusCard from "../components/StatusCard"
import AlertCard from "../components/AlertCard"
import QuickActionButton from "../components/QuickActionButton"

const HomeScreen = () => {
  const { data, loading, refreshData, armSecurity, controlDevice } = useSmartHome()

  const handleSecurityToggle = async () => {
    const success = await armSecurity(!data.security.armed)
    if (success) {
      Alert.alert("Security System", `Security system ${!data.security.armed ? "armed" : "disarmed"} successfully`)
    } else {
      Alert.alert("Error", "Failed to toggle security system")
    }
  }

  const handleLightsToggle = async () => {
    // Toggle all lights
    const allOn = data.security.lights.every((light: any) => light.on)
    const promises = data.security.lights.map((light: any) => controlDevice(light.id, "toggle", !allOn))

    const results = await Promise.all(promises)
    if (results.every((result) => result)) {
      Alert.alert("Lights", `All lights turned ${allOn ? "off" : "on"}`)
    }
  }

  const getSecurityStatus = () => {
    if (data.security.intrusion) return { text: "ALERT", color: "#ef4444" }
    if (data.security.armed) return { text: "ARMED", color: "#10b981" }
    return { text: "DISARMED", color: "#f59e0b" }
  }

  const getAirQualityStatus = (quality: number) => {
    if (quality >= 80) return { text: "Excellent", color: "#10b981" }
    if (quality >= 60) return { text: "Good", color: "#3b82f6" }
    if (quality >= 40) return { text: "Moderate", color: "#f59e0b" }
    return { text: "Poor", color: "#ef4444" }
  }

  const securityStatus = getSecurityStatus()
  const airQualityStatus = getAirQualityStatus(data.environment.airQuality)

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}
            </Text>
            <Text style={styles.homeTitle}>Smart Home Control</Text>
          </View>
          <TouchableOpacity onPress={refreshData} style={styles.refreshButton}>
            <Icon name="refresh" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} />}
      >
        {/* Critical Alerts */}
        {data.alerts.filter((alert) => alert.severity === "critical" || alert.severity === "high").length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>🚨 Critical Alerts</Text>
            {data.alerts
              .filter((alert) => alert.severity === "critical" || alert.severity === "high")
              .slice(0, 2)
              .map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
          </View>
        )}

        {/* Status Overview */}
        <View style={styles.statusGrid}>
          <StatusCard
            title="Security"
            value={securityStatus.text}
            icon="security"
            color={securityStatus.color}
            subtitle={`${data.security.cameras.length} cameras active`}
          />
          <StatusCard
            title="Temperature"
            value={`${data.environment.temperature.toFixed(1)}°C`}
            icon="thermostat"
            color="#3b82f6"
            subtitle="Optimal range"
          />
          <StatusCard
            title="Energy"
            value={`${(data.energy.currentPower / 1000).toFixed(1)}kW`}
            icon="flash-on"
            color="#f59e0b"
            subtitle={`$${data.energy.dailyCost.toFixed(2)}/day`}
          />
          <StatusCard
            title="Air Quality"
            value={data.environment.airQuality.toString()}
            icon="air"
            color={airQualityStatus.color}
            subtitle={airQualityStatus.text}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickActionButton
              title={data.security.armed ? "Disarm Security" : "Arm Security"}
              icon="security"
              color={data.security.armed ? "#ef4444" : "#10b981"}
              onPress={handleSecurityToggle}
            />
            <QuickActionButton title="Toggle Lights" icon="lightbulb" color="#f59e0b" onPress={handleLightsToggle} />
            <QuickActionButton
              title="Lock All Doors"
              icon="lock"
              color="#6366f1"
              onPress={() => {
                // Implement lock all doors
                Alert.alert("Doors", "All doors locked successfully")
              }}
            />
            <QuickActionButton
              title="Emergency"
              icon="warning"
              color="#ef4444"
              onPress={() => {
                Alert.alert("Emergency", "Are you sure you want to trigger emergency protocol?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Confirm", style: "destructive" },
                ])
              }}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {data.alerts.slice(0, 5).map((alert) => (
            <AlertCard key={alert.id} alert={alert} compact />
          ))}
        </View>

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <Icon name="wifi" size={20} color="#10b981" />
              <Text style={styles.healthLabel}>WiFi</Text>
              <Text style={styles.healthValue}>{data.systemHealth.wifiStrength}%</Text>
            </View>
            <View style={styles.healthItem}>
              <Icon name="speed" size={20} color="#3b82f6" />
              <Text style={styles.healthLabel}>Internet</Text>
              <Text style={styles.healthValue}>{data.systemHealth.internetSpeed.toFixed(0)} Mbps</Text>
            </View>
            <View style={styles.healthItem}>
              <Icon name="memory" size={20} color="#f59e0b" />
              <Text style={styles.healthLabel}>Load</Text>
              <Text style={styles.healthValue}>{data.systemHealth.systemLoad}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "#e0e7ff",
  },
  homeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  section: {
    marginTop: 30,
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  healthGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthItem: {
    alignItems: "center",
  },
  healthLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  healthValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 2,
  },
})

export default HomeScreen
