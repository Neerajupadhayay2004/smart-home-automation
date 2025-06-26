"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { RTCView } from "react-native-webrtc"
import Icon from "react-native-vector-icons/MaterialIcons"
import WebRTCService, { type CameraStream } from "../services/WebRTCService"

interface CameraGridProps {
  cameras: Array<{
    id: string
    name: string
    status: string
  }>
  onCameraPress: (cameraId: string) => void
  maxColumns?: number
}

const { width: screenWidth } = Dimensions.get("window")

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, onCameraPress, maxColumns = 2 }) => {
  const [cameraStreams, setCameraStreams] = useState<Map<string, CameraStream>>(new Map())
  const [connectedCameras, setConnectedCameras] = useState<Set<string>>(new Set())

  useEffect(() => {
    setupEventListeners()
    return () => {
      cleanup()
    }
  }, [])

  const setupEventListeners = () => {
    WebRTCService.on("streamReceived", handleStreamReceived)
    WebRTCService.on("connectionStateChanged", handleConnectionStateChanged)
    WebRTCService.on("cameraDisconnected", handleCameraDisconnected)
  }

  const cleanup = () => {
    WebRTCService.off("streamReceived", handleStreamReceived)
    WebRTCService.off("connectionStateChanged", handleConnectionStateChanged)
    WebRTCService.off("cameraDisconnected", handleCameraDisconnected)

    // Disconnect all cameras
    connectedCameras.forEach((cameraId) => {
      WebRTCService.disconnectFromCamera(cameraId)
    })
  }

  const handleStreamReceived = (data: { cameraId: string; stream: CameraStream }) => {
    setCameraStreams((prev) => new Map(prev.set(data.cameraId, data.stream)))
    setConnectedCameras((prev) => new Set(prev.add(data.cameraId)))
  }

  const handleConnectionStateChanged = (data: { cameraId: string; state: string; stream: CameraStream }) => {
    if (data.state === "connected") {
      setCameraStreams((prev) => new Map(prev.set(data.cameraId, data.stream)))
      setConnectedCameras((prev) => new Set(prev.add(data.cameraId)))
    } else if (data.state === "disconnected") {
      setCameraStreams((prev) => {
        const newMap = new Map(prev)
        newMap.delete(data.cameraId)
        return newMap
      })
      setConnectedCameras((prev) => {
        const newSet = new Set(prev)
        newSet.delete(data.cameraId)
        return newSet
      })
    }
  }

  const handleCameraDisconnected = (data: { cameraId: string }) => {
    setCameraStreams((prev) => {
      const newMap = new Map(prev)
      newMap.delete(data.cameraId)
      return newMap
    })
    setConnectedCameras((prev) => {
      const newSet = new Set(prev)
      newSet.delete(data.cameraId)
      return newSet
    })
  }

  const connectToCamera = async (cameraId: string) => {
    if (!connectedCameras.has(cameraId)) {
      await WebRTCService.connectToCamera(cameraId, "low") // Use low quality for grid view
    }
  }

  const disconnectFromCamera = async (cameraId: string) => {
    if (connectedCameras.has(cameraId)) {
      await WebRTCService.disconnectFromCamera(cameraId)
    }
  }

  const cardWidth = (screenWidth - 60) / maxColumns // 60 = padding + gaps

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {cameras.map((camera) => {
          const stream = cameraStreams.get(camera.id)
          const isConnected = connectedCameras.has(camera.id)

          return (
            <TouchableOpacity
              key={camera.id}
              style={[styles.cameraCard, { width: cardWidth }]}
              onPress={() => onCameraPress(camera.id)}
              onLongPress={() => {
                if (isConnected) {
                  disconnectFromCamera(camera.id)
                } else {
                  connectToCamera(camera.id)
                }
              }}
            >
              <View style={styles.cameraPreview}>
                {stream?.stream ? (
                  <RTCView style={styles.videoStream} streamURL={stream.stream.toURL()} objectFit="cover" />
                ) : (
                  <View style={styles.placeholderView}>
                    <Icon
                      name={isConnected ? "videocam" : "videocam-off"}
                      size={32}
                      color={isConnected ? "#10b981" : "#6b7280"}
                    />
                  </View>
                )}

                {/* Connection Status */}
                <View style={[styles.connectionStatus, { backgroundColor: isConnected ? "#10b981" : "#ef4444" }]}>
                  <View style={styles.statusDot} />
                </View>

                {/* Camera Name Overlay */}
                <View style={styles.nameOverlay}>
                  <Text style={styles.cameraName} numberOfLines={1}>
                    {camera.name}
                  </Text>
                </View>

                {/* Recording Indicator */}
                {stream?.isRecording && (
                  <View style={styles.recordingBadge}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>REC</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  cameraCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraPreview: {
    aspectRatio: 16 / 9,
    backgroundColor: "#1f2937",
    position: "relative",
  },
  videoStream: {
    flex: 1,
  },
  placeholderView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  connectionStatus: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  nameOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cameraName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  recordingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recordingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ffffff",
    marginRight: 4,
  },
  recordingText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#ffffff",
  },
})

export default CameraGrid
