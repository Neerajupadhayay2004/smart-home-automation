"use client"

import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import LinearGradient from "react-native-linear-gradient"
import { useSmartHome } from "../context/SmartHomeContext"

const SecurityScreen = () => {
  const navigation = useNavigation()
  const { data, armSecurity, controlDevice } = useSmartHome()
  const [loading, setLoading] = useState(false)

  const handleSecurityToggle = async (armed: boolean) => {
    setLoading(true)
    const success = await armSecurity(armed)
    setLoading(false)

    if (success) {
      Alert.alert("Security System", `Security system ${armed ? "armed" : "disarmed"} successfully`)
    } else {
      Alert.alert("Error", "Failed to change security system status")
    }
  }

  const handleDoorToggle = async (doorId: string, locked: boolean) => {
    const success = await controlDevice(doorId, "lock", locked)
    if (success) {
      Alert.alert("Door Control", `Door ${locked ? "locked" : "unlocked"} successfully`)
    }
  }

  const handleLightToggle = async (lightId: string, on: boolean) => {
    const success = await controlDevice(lightId, "toggle", on)
    if (success) {
      Alert.alert("Light Control", `Light turned ${on ? "on" : "off"} successfully`)
    }
  }

  const handleCameraPress = (camera: any) => {
    navigation.navigate("CameraDetail" as never, { camera } as never)
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#ef4444", "#dc2626"]} style={styles.header}>
        <Text style={styles.headerTitle}>Security Control</Text>
        <Text style={styles.headerSubtitle}>Monitor and control your home security</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Security Status */}
        <View style={styles.section}>
          <View style={styles.securityStatus}>
            <View style={styles.statusInfo}>
              <Icon
                name={data.security.intrusion ? "warning" : data.security.armed ? "security" : "security"}
                size={32}
                color={data.security.intrusion ? "#ef4444" : data.security.armed ? "#10b981" : "#f59e0b"}
              />
              <View style={styles.statusText}>
                <Text style={styles.statusTitle}>
                  {data.security.intrusion ? "ALERT ACTIVE" : data.security.armed ? "SYSTEM ARMED" : "SYSTEM DISARMED"}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {data.security.intrusion ? "Security breach detected!" : "All systems monitoring"}
                </Text>
              </View>
            </View>
            <Switch
              value={data.security.armed}
              onValueChange={handleSecurityToggle}
              disabled={loading || data.security.intrusion}
              trackColor={{ false: "#f3f4f6", true: "#10b981" }}
              thumbColor={data.security.armed ? "#ffffff" : "#9ca3af"}
            />
          </View>
        </View>

        {/* Cameras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Cameras</Text>
          <View style={styles.cameraGrid}>
            {data.security.cameras.map((camera: any) => (
              <TouchableOpacity key={camera.id} style={styles.cameraCard} onPress={() => handleCameraPress(camera)}>
                <View style={styles.cameraPreview}>
                  <Icon name="videocam" size={40} color="#6b7280" />
                  {camera.recording && (
                    <View style={styles.recordingIndicator}>
                      <View style={styles.recordingDot} />
                      <Text style={styles.recordingText}>REC</Text>
                    </View>
                  )}
                  <View style={styles.webrtcIndicator}>
                    <Icon name="wifi" size={16} color="#10b981" />
                    <Text style={styles.webrtcText}>WebRTC</Text>
                  </View>
                </View>
                <View style={styles.cameraInfo}>
                  <Text style={styles.cameraName}>{camera.name}</Text>
                  <Text style={styles.cameraStatus}>
                    {camera.status} • {camera.recording ? "Recording" : "Live Ready"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Door Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Access Control</Text>
          {data.security.doors.map((door: any) => (
            <View key={door.id} style={styles.controlItem}>
              <View style={styles.controlInfo}>
                <Icon name={door.locked ? "lock" : "lock-open"} size={24} color={door.locked ? "#10b981" : "#ef4444"} />
                <View style={styles.controlText}>
                  <Text style={styles.controlName}>{door.name}</Text>
                  <Text style={styles.controlStatus}>{door.locked ? "Locked" : "Unlocked"}</Text>
                </View>
              </View>
              <Switch
                value={door.locked}
                onValueChange={(locked) => handleDoorToggle(door.id, locked)}
                trackColor={{ false: "#f3f4f6", true: "#10b981" }}
                thumbColor={door.locked ? "#ffffff" : "#9ca3af"}
              />
            </View>
          ))}
        </View>

        {/* Light Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Lighting</Text>
          {data.security.lights.map((light: any) => (
            <View key={light.id} style={styles.controlItem}>
              <View style={styles.controlInfo}>
                <Icon name="lightbulb" size={24} color={light.on ? "#f59e0b" : "#9ca3af"} />
                <View style={styles.controlText}>
                  <Text style={styles.controlName}>{light.name}</Text>
                  <Text style={styles.controlStatus}>{light.on ? `On • ${light.brightness || 100}%` : "Off"}</Text>
                </View>
              </View>
              <Switch
                value={light.on}
                onValueChange={(on) => handleLightToggle(light.id, on)}
                trackColor={{ false: "#f3f4f6", true: "#f59e0b" }}
                thumbColor={light.on ? "#ffffff" : "#9ca3af"}
              />
            </View>
          ))}
        </View>

        {/* Emergency Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Actions</Text>
          <TouchableOpacity style={styles.emergencyButton}>
            <Icon name="warning" size={24} color="#ffffff" />
            <Text style={styles.emergencyButtonText}>Trigger Emergency Alert</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.panicButton}>
            <Icon name="phone" size={24} color="#ffffff" />
            <Text style={styles.panicButtonText}>Call Emergency Services</Text>
          </TouchableOpacity>
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
    color: "#fecaca",
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
  securityStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusText: {
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  cameraGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cameraCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraPreview: {
    height: 80,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  recordingIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    marginRight: 4,
  },
  recordingText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  cameraInfo: {
    marginTop: 8,
  },
  cameraName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  cameraStatus: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  controlItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  controlInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  controlText: {
    marginLeft: 12,
  },
  controlName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  controlStatus: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  panicButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 12,
    padding: 16,
  },
  panicButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  webrtcIndicator: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.8)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  webrtcText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 2,
  },
})

export default SecurityScreen
