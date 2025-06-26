import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import LinearGradient from "react-native-linear-gradient"
import { useSmartHome } from "../context/SmartHomeContext"
import { ProgressBar } from "../components/ProgressBar"

const EnvironmentScreen = () => {
  const { data } = useSmartHome()

  const getAirQualityStatus = (quality: number) => {
    if (quality >= 80) return { text: "Excellent", color: "#10b981" }
    if (quality >= 60) return { text: "Good", color: "#3b82f6" }
    if (quality >= 40) return { text: "Moderate", color: "#f59e0b" }
    return { text: "Poor", color: "#ef4444" }
  }

  const getTemperatureColor = (temp: number) => {
    if (temp < 18) return "#3b82f6"
    if (temp > 26) return "#ef4444"
    return "#10b981"
  }

  const getHumidityColor = (humidity: number) => {
    if (humidity < 30 || humidity > 70) return "#f59e0b"
    return "#10b981"
  }

  const airQualityStatus = getAirQualityStatus(data.environment.airQuality)

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#10b981", "#059669"]} style={styles.header}>
        <Text style={styles.headerTitle}>Environment Control</Text>
        <Text style={styles.headerSubtitle}>Monitor and optimize your indoor climate</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Climate Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Climate Status</Text>
          <View style={styles.climateGrid}>
            <View style={styles.climateCard}>
              <Icon name="thermostat" size={32} color={getTemperatureColor(data.environment.temperature)} />
              <Text style={styles.climateValue}>{data.environment.temperature.toFixed(1)}°C</Text>
              <Text style={styles.climateLabel}>Temperature</Text>
              <ProgressBar
                progress={(data.environment.temperature / 35) * 100}
                color={getTemperatureColor(data.environment.temperature)}
              />
            </View>
            <View style={styles.climateCard}>
              <Icon name="water-drop" size={32} color={getHumidityColor(data.environment.humidity)} />
              <Text style={styles.climateValue}>{data.environment.humidity.toFixed(0)}%</Text>
              <Text style={styles.climateLabel}>Humidity</Text>
              <ProgressBar progress={data.environment.humidity} color={getHumidityColor(data.environment.humidity)} />
            </View>
          </View>
        </View>

        {/* Air Quality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Air Quality</Text>
          <View style={styles.airQualityCard}>
            <View style={styles.airQualityHeader}>
              <Icon name="air" size={40} color={airQualityStatus.color} />
              <View style={styles.airQualityInfo}>
                <Text style={styles.airQualityValue}>{data.environment.airQuality.toFixed(0)}</Text>
                <Text style={[styles.airQualityStatus, { color: airQualityStatus.color }]}>
                  {airQualityStatus.text}
                </Text>
              </View>
            </View>
            <ProgressBar progress={data.environment.airQuality} color={airQualityStatus.color} />
            <View style={styles.airQualityDetails}>
              <View style={styles.airQualityDetail}>
                <Text style={styles.detailLabel}>CO₂ Level</Text>
                <Text style={styles.detailValue}>{data.environment.co2.toFixed(0)} ppm</Text>
              </View>
              <View style={styles.airQualityDetail}>
                <Text style={styles.detailLabel}>Recommendation</Text>
                <Text style={styles.detailValue}>
                  {data.environment.airQuality < 60 ? "Improve ventilation" : "Maintain current levels"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Environmental Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environmental Alerts</Text>
          <View style={styles.alertsContainer}>
            {data.environment.temperature > 26 && (
              <View style={styles.alertCard}>
                <Icon name="warning" size={20} color="#ef4444" />
                <Text style={styles.alertText}>Temperature is above optimal range. Consider adjusting HVAC.</Text>
              </View>
            )}
            {data.environment.humidity > 70 && (
              <View style={styles.alertCard}>
                <Icon name="warning" size={20} color="#f59e0b" />
                <Text style={styles.alertText}>High humidity detected. Check ventilation systems.</Text>
              </View>
            )}
            {data.environment.airQuality < 60 && (
              <View style={styles.alertCard}>
                <Icon name="warning" size={20} color="#f59e0b" />
                <Text style={styles.alertText}>Air quality is below optimal. Consider using air purifier.</Text>
              </View>
            )}
            {data.environment.co2 > 800 && (
              <View style={styles.alertCard}>
                <Icon name="warning" size={20} color="#ef4444" />
                <Text style={styles.alertText}>CO₂ levels are elevated. Increase ventilation immediately.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Climate Control */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Climate Control</Text>
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="ac-unit" size={24} color="#3b82f6" />
              <Text style={styles.controlButtonText}>Cool Down</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="whatshot" size={24} color="#ef4444" />
              <Text style={styles.controlButtonText}>Heat Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="air" size={24} color="#10b981" />
              <Text style={styles.controlButtonText}>Ventilate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="auto-awesome" size={24} color="#6366f1" />
              <Text style={styles.controlButtonText}>Auto Mode</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Historical Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>24-Hour Trends</Text>
          <View style={styles.trendsCard}>
            <View style={styles.trendItem}>
              <Icon name="trending-up" size={20} color="#10b981" />
              <View style={styles.trendInfo}>
                <Text style={styles.trendLabel}>Temperature</Text>
                <Text style={styles.trendValue}>+2.3°C from yesterday</Text>
              </View>
            </View>
            <View style={styles.trendItem}>
              <Icon name="trending-down" size={20} color="#ef4444" />
              <View style={styles.trendInfo}>
                <Text style={styles.trendLabel}>Humidity</Text>
                <Text style={styles.trendValue}>-5% from yesterday</Text>
              </View>
            </View>
            <View style={styles.trendItem}>
              <Icon name="trending-up" size={20} color="#10b981" />
              <View style={styles.trendInfo}>
                <Text style={styles.trendLabel}>Air Quality</Text>
                <Text style={styles.trendValue}>+12 points improvement</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          <View style={styles.recommendationsContainer}>
            <View style={styles.recommendationCard}>
              <Icon name="lightbulb" size={20} color="#f59e0b" />
              <Text style={styles.recommendationText}>Optimal temperature range is 20-24°C for energy efficiency</Text>
            </View>
            <View style={styles.recommendationCard}>
              <Icon name="eco" size={20} color="#10b981" />
              <Text style={styles.recommendationText}>Consider opening windows during cooler evening hours</Text>
            </View>
            <View style={styles.recommendationCard}>
              <Icon name="schedule" size={20} color="#3b82f6" />
              <Text style={styles.recommendationText}>Schedule HVAC to reduce usage during peak energy hours</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#d1fae5",
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
  climateGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  climateCard: {
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
  climateValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 8,
    marginBottom: 4,
  },
  climateLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
  },
  airQualityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  airQualityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  airQualityInfo: {
    marginLeft: 16,
  },
  airQualityValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#374151",
  },
  airQualityStatus: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  airQualityDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  airQualityDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  alertsContainer: {
    gap: 8,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    marginLeft: 8,
  },
  controlsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  controlButton: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginTop: 8,
  },
  trendsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  trendInfo: {
    marginLeft: 12,
  },
  trendLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  trendValue: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  recommendationsContainer: {
    gap: 8,
  },
  recommendationCard: {
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
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    lineHeight: 20,
  },
})

export default EnvironmentScreen
