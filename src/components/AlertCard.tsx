import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useSmartHome } from "../context/SmartHomeContext"

interface AlertCardProps {
  alert: {
    id: string
    type: string
    message: string
    severity: string
    timestamp: string
  }
  compact?: boolean
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, compact = false }) => {
  const { dismissAlert } = useSmartHome()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#ef4444"
      case "high":
        return "#f59e0b"
      case "medium":
        return "#3b82f6"
      default:
        return "#10b981"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security":
        return "security"
      case "energy":
        return "flash-on"
      case "environment":
        return "eco"
      default:
        return "info"
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <View style={[styles.card, compact && styles.compactCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name={getTypeIcon(alert.type)} size={compact ? 16 : 20} color={getSeverityColor(alert.severity)} />
          <Text style={[styles.message, compact && styles.compactMessage]}>{alert.message}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.timestamp}>{formatTime(alert.timestamp)}</Text>
          <Text style={[styles.severity, { color: getSeverityColor(alert.severity) }]}>
            {alert.severity.toUpperCase()}
          </Text>
        </View>
      </View>
      {!compact && (
        <TouchableOpacity style={styles.dismissButton} onPress={() => dismissAlert(alert.id)}>
          <Icon name="close" size={16} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  compactCard: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    lineHeight: 18,
  },
  compactMessage: {
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
  },
  severity: {
    fontSize: 10,
    fontWeight: "600",
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
})

export default AlertCard
