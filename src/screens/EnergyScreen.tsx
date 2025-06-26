import { View, Text, ScrollView, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import LinearGradient from "react-native-linear-gradient"
import { useSmartHome } from "../context/SmartHomeContext"
import { ProgressBar } from "../components/ProgressBar"

const EnergyScreen = () => {
  const { data } = useSmartHome()

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return "#10b981"
    if (efficiency >= 70) return "#f59e0b"
    return "#ef4444"
  }

  const getCurrentHour = () => new Date().getHours()
  const isPeakHour = () => {
    const hour = getCurrentHour()
    return hour >= 16 && hour <= 21
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#f59e0b", "#d97706"]} style={styles.header}>
        <Text style={styles.headerTitle}>Energy Management</Text>
        <Text style={styles.headerSubtitle}>Monitor and optimize your energy usage</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Current Usage Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Usage</Text>
          <View style={styles.usageGrid}>
            <View style={styles.usageCard}>
              <Icon name="flash-on" size={32} color="#f59e0b" />
              <Text style={styles.usageValue}>{(data.energy.currentPower / 1000).toFixed(1)}</Text>
              <Text style={styles.usageUnit}>kW</Text>
              <Text style={styles.usageLabel}>Current Draw</Text>
            </View>
            <View style={styles.usageCard}>
              <Icon name="attach-money" size={32} color="#10b981" />
              <Text style={styles.usageValue}>{data.energy.dailyCost.toFixed(2)}</Text>
              <Text style={styles.usageUnit}>USD</Text>
              <Text style={styles.usageLabel}>Daily Cost</Text>
            </View>
          </View>
        </View>

        {/* Solar & Battery */}
        {data.energy.solarGeneration > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Renewable Energy</Text>
            <View style={styles.renewableGrid}>
              <View style={styles.renewableCard}>
                <Icon name="wb-sunny" size={24} color="#f59e0b" />
                <View style={styles.renewableInfo}>
                  <Text style={styles.renewableValue}>{data.energy.solarGeneration}W</Text>
                  <Text style={styles.renewableLabel}>Solar Generation</Text>
                </View>
                <ProgressBar progress={(data.energy.solarGeneration / 1000) * 100} color="#f59e0b" />
              </View>
              {data.energy.batteryLevel && (
                <View style={styles.renewableCard}>
                  <Icon name="battery-charging-full" size={24} color="#10b981" />
                  <View style={styles.renewableInfo}>
                    <Text style={styles.renewableValue}>{data.energy.batteryLevel}%</Text>
                    <Text style={styles.renewableLabel}>Battery Level</Text>
                  </View>
                  <ProgressBar progress={data.energy.batteryLevel} color="#10b981" />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Peak Hours Alert */}
        {isPeakHour() && (
          <View style={styles.peakAlert}>
            <Icon name="warning" size={24} color="#f59e0b" />
            <View style={styles.peakAlertText}>
              <Text style={styles.peakAlertTitle}>Peak Hours Active</Text>
              <Text style={styles.peakAlertSubtitle}>Higher rates apply (4:00 PM - 9:00 PM)</Text>
            </View>
          </View>
        )}

        {/* Device Energy Monitor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Consumption</Text>
          {data.energy.devices.map((device: any) => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                  <View
                    style={[
                      styles.deviceStatus,
                      {
                        backgroundColor:
                          device.status === "on" ? "#10b981" : device.status === "standby" ? "#f59e0b" : "#9ca3af",
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceCategory}>{device.category}</Text>
                  </View>
                </View>
                <View style={styles.deviceMetrics}>
                  <Text style={styles.devicePower}>{device.power.toFixed(0)}W</Text>
                  <Text style={styles.deviceCost}>${(((device.power * 0.12) / 1000) * 24).toFixed(2)}/day</Text>
                </View>
              </View>
              <View style={styles.deviceFooter}>
                <View style={styles.efficiencyContainer}>
                  <Text style={styles.efficiencyLabel}>Efficiency</Text>
                  <View style={styles.efficiencyBar}>
                    <View
                      style={[
                        styles.efficiencyFill,
                        {
                          width: `${device.efficiency || 85}%`,
                          backgroundColor: getEfficiencyColor(device.efficiency || 85),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.efficiencyText, { color: getEfficiencyColor(device.efficiency || 85) }]}>
                    {device.efficiency || 85}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Energy Saving Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy Saving Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <Icon name="schedule" size={20} color="#3b82f6" />
              <Text style={styles.tipText}>Schedule high-energy appliances during off-peak hours (9 PM - 4 PM)</Text>
            </View>
            <View style={styles.tipCard}>
              <Icon name="thermostat" size={20} color="#10b981" />
              <Text style={styles.tipText}>Adjust thermostat by 2°C to save up to 15% on heating/cooling costs</Text>
            </View>
            <View style={styles.tipCard}>
              <Icon name="lightbulb" size={20} color="#f59e0b" />
              <Text style={styles.tipText}>Use smart lighting automation to reduce unnecessary energy consumption</Text>
            </View>
          </View>
        </View>

        {/* Monthly Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Monthly Cost</Text>
              <Text style={styles.summaryValue}>${(data.energy.dailyCost * 30).toFixed(0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Daily Usage</Text>
              <Text style={styles.summaryValue}>{((data.energy.currentPower / 1000) * 24).toFixed(1)} kWh</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Carbon Footprint</Text>
              <Text style={styles.summaryValue}>12.5 kg CO₂</Text>
            </View>
            {data.energy.solarGeneration > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Solar Savings</Text>
                <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                  ${((data.energy.solarGeneration / 1000) * 24 * 0.12 * 30).toFixed(0)}
                </Text>
              </View>
            )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fef3c7",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  usageGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  usageCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usageValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 8,
  },
  usageUnit: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: -4,
  },
  usageLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  renewableGrid: {
    gap: 12,
  },
  renewableCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  renewableInfo: {
    flex: 1,
    marginLeft: 12,
  },
  renewableValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  renewableLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  peakAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  peakAlertText: {
    marginLeft: 12,
  },
  peakAlertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400e",
  },
  peakAlertSubtitle: {
    fontSize: 14,
    color: "#a16207",
    marginTop: 2,
  },
  deviceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deviceStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  deviceCategory: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    textTransform: "capitalize",
  },
  deviceMetrics: {
    alignItems: "flex-end",
  },
  devicePower: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  deviceCost: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  deviceFooter: {
    marginTop: 12,
  },
  efficiencyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  efficiencyLabel: {
    fontSize: 12,
    color: "#6b7280",
    width: 60,
  },
  efficiencyBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginHorizontal: 8,
  },
  efficiencyFill: {
    height: "100%",
    borderRadius: 2,
  },
  efficiencyText: {
    fontSize: 12,
    fontWeight: "500",
    width: 30,
    textAlign: "right",
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
})

export default EnergyScreen
