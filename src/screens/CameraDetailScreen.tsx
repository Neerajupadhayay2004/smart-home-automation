"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import LinearGradient from "react-native-linear-gradient"
import LiveCameraView from "../components/LiveCameraView"

interface CameraDetailRoute {
  params: {
    camera: {
      id: string
      name: string
      status: string
      recording: boolean
      aiDetection: boolean
      lastMotion?: string
      confidence?: number
    }
  }
}

const CameraDetailScreen = () => {
  const route = useRoute() as CameraDetailRoute
  const navigation = useNavigation()
  const { camera } = route.params

  const [isLiveViewActive, setIsLiveViewActive] = useState(false)
  const [cameraSettings, setCameraSettings] = useState({
    motionDetection: true,
    nightVision: false,
    audioRecording: true,
    cloudStorage: true,
    notifications: true,
    sensitivity: "medium" as "low" | "medium" | "high",
  })
  const [recordings, setRecordings] = useState([
    {
      id: "1",
      timestamp: "2024-01-15 14:30:25",
      duration: "00:02:15",
      type: "motion",
      thumbnail: null,
    },
    {
      id: "2",
      timestamp: "2024-01-15 12:15:10",
      duration: "00:01:45",
      type: "manual",
      thumbnail: null,
    },
    {
      id: "3",
      timestamp: "2024-01-15 09:22:33",
      duration: "00:03:20",
      type: "motion",
      thumbnail: null,
    },
  ])

  const startLiveView = () => {
    setIsLiveViewActive(true)
  }

  const stopLiveView = () => {
    setIsLiveViewActive(false)
  }

  const updateCameraSetting = (setting: string, value: any) => {
    setCameraSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))

    // Send setting update to camera
    // This would typically make an API call
    console.log(`Updating ${setting} to ${value} for camera ${camera.id}`)
  }

  const deleteRecording = (recordingId: string) => {
    Alert.alert("Delete Recording", "Are you sure you want to delete this recording?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setRecordings((prev) => prev.filter((r) => r.id !== recordingId))
        },
      },
    ])
  }

  const downloadRecording = (recordingId: string) => {
    Alert.alert("Download", `Downloading recording ${recordingId}...`)
    // Implement download functionality
  }

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      case "low":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  if (isLiveViewActive) {
    return <LiveCameraView cameraId={camera.id} cameraName={camera.name} onClose={stopLiveView} showControls={true} />
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#3b82f6", "#1d4ed8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{camera.name}</Text>
            <Text style={styles.headerSubtitle}>
              {camera.status} • {camera.aiDetection ? "AI Enabled" : "Standard"}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="settings" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Live View Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live View</Text>
          <TouchableOpacity style={styles.liveViewCard} onPress={startLiveView}>
            <View style={styles.liveViewPreview}>
              <Icon name="videocam" size={60} color="#6b7280" />
              <View style={styles.liveViewOverlay}>
                <Icon name="play-circle-filled" size={40} color="#ffffff" />
              </View>
            </View>
            <View style={styles.liveViewInfo}>
              <Text style={styles.liveViewTitle}>Start Live Stream</Text>
              <Text style={styles.liveViewSubtitle}>HD quality • Two-way audio • PTZ controls</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Camera Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Icon name="videocam" size={24} color="#10b981" />
              <Text style={styles.statusValue}>Online</Text>
              <Text style={styles.statusLabel}>Connection</Text>
            </View>
            <View style={styles.statusCard}>
              <Icon name="motion-photos-on" size={24} color="#3b82f6" />
              <Text style={styles.statusValue}>{camera.lastMotion || "None"}</Text>
              <Text style={styles.statusLabel}>Last Motion</Text>
            </View>
            <View style={styles.statusCard}>
              <Icon name="psychology" size={24} color="#8b5cf6" />
              <Text style={styles.statusValue}>{camera.confidence || 0}%</Text>
              <Text style={styles.statusLabel}>AI Confidence</Text>
            </View>
            <View style={styles.statusCard}>
              <Icon name="storage" size={24} color="#f59e0b" />
              <Text style={styles.statusValue}>2.4 GB</Text>
              <Text style={styles.statusLabel}>Storage Used</Text>
            </View>
          </View>
        </View>

        {/* Camera Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Motion Detection</Text>
                <Text style={styles.settingSubtitle}>Detect movement and send alerts</Text>
              </View>
              <Switch
                value={cameraSettings.motionDetection}
                onValueChange={(value) => updateCameraSetting("motionDetection", value)}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Night Vision</Text>
                <Text style={styles.settingSubtitle}>Automatic infrared mode</Text>
              </View>
              <Switch
                value={cameraSettings.nightVision}
                onValueChange={(value) => updateCameraSetting("nightVision", value)}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Audio Recording</Text>
                <Text style={styles.settingSubtitle}>Record audio with video</Text>
              </View>
              <Switch
                value={cameraSettings.audioRecording}
                onValueChange={(value) => updateCameraSetting("audioRecording", value)}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Cloud Storage</Text>
                <Text style={styles.settingSubtitle}>Backup recordings to cloud</Text>
              </View>
              <Switch
                value={cameraSettings.cloudStorage}
                onValueChange={(value) => updateCameraSetting("cloudStorage", value)}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Receive motion alerts</Text>
              </View>
              <Switch
                value={cameraSettings.notifications}
                onValueChange={(value) => updateCameraSetting("notifications", value)}
              />
            </View>

            {/* Sensitivity Setting */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Motion Sensitivity</Text>
                <Text style={styles.settingSubtitle}>Adjust detection sensitivity</Text>
              </View>
              <View style={styles.sensitivityControls}>
                {(["low", "medium", "high"] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.sensitivityButton,
                      cameraSettings.sensitivity === level && {
                        backgroundColor: getSensitivityColor(level),
                      },
                    ]}
                    onPress={() => updateCameraSetting("sensitivity", level)}
                  >
                    <Text
                      style={[
                        styles.sensitivityButtonText,
                        cameraSettings.sensitivity === level && styles.activeSensitivityText,
                      ]}
                    >
                      {level.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Recent Recordings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Recordings</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recordingsContainer}>
            {recordings.map((recording) => (
              <View key={recording.id} style={styles.recordingItem}>
                <View style={styles.recordingThumbnail}>
                  <Icon name="play-circle-filled" size={24} color="#ffffff" />
                </View>
                <View style={styles.recordingInfo}>
                  <Text style={styles.recordingTimestamp}>{recording.timestamp}</Text>
                  <Text style={styles.recordingDetails}>
                    {recording.duration} • {recording.type}
                  </Text>
                </View>
                <View style={styles.recordingActions}>
                  <TouchableOpacity style={styles.recordingAction} onPress={() => downloadRecording(recording.id)}>
                    <Icon name="download" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.recordingAction} onPress={() => deleteRecording(recording.id)}>
                    <Icon name="delete" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={startLiveView}>
              <Icon name="videocam" size={24} color="#ffffff" />
              <Text style={styles.quickActionText}>Live View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="fiber-manual-record" size={24} color="#ffffff" />
              <Text style={styles.quickActionText}>Record Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="photo-camera" size={24} color="#ffffff" />
              <Text style={styles.quickActionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="share" size={24} color="#ffffff" />
              <Text style={styles.quickActionText}>Share Access</Text>
            </TouchableOpacity>
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
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#dbeafe",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  viewAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  liveViewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveViewPreview: {
    height: 200,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  liveViewOverlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  liveViewInfo: {
    padding: 16,
  },
  liveViewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  liveViewSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statusCard: {
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
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  settingsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  sensitivityControls: {
    flexDirection: "row",
  },
  sensitivityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginLeft: 4,
  },
  sensitivityButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeSensitivityText: {
    color: "#ffffff",
  },
  recordingsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  recordingThumbnail: {
    width: 60,
    height: 40,
    backgroundColor: "#1f2937",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTimestamp: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  recordingDetails: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  recordingActions: {
    flexDirection: "row",
  },
  recordingAction: {
    padding: 8,
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: "48%",
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 8,
  },
})

export default CameraDetailScreen
