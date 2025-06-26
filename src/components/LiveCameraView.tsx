"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native"
import { RTCView } from "react-native-webrtc"
import Icon from "react-native-vector-icons/MaterialIcons"
import LinearGradient from "react-native-linear-gradient"
import WebRTCService, { type CameraStream } from "../services/WebRTCService"

interface LiveCameraViewProps {
  cameraId: string
  cameraName: string
  onClose: () => void
  showControls?: boolean
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const LiveCameraView: React.FC<LiveCameraViewProps> = ({ cameraId, cameraName, onClose, showControls = true }) => {
  const [cameraStream, setCameraStream] = useState<CameraStream | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isTwoWayAudioEnabled, setIsTwoWayAudioEnabled] = useState(false)
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium")
  const [showControlsOverlay, setShowControlsOverlay] = useState(true)
  const [nightVisionEnabled, setNightVisionEnabled] = useState(false)

  // PTZ controls
  const [ptzPosition, setPtzPosition] = useState({ pan: 0, tilt: 0, zoom: 1 })
  const lastPanRef = useRef({ x: 0, y: 0 })
  const lastZoomRef = useRef(1)

  useEffect(() => {
    connectToCamera()
    setupEventListeners()

    return () => {
      cleanup()
    }
  }, [cameraId])

  const connectToCamera = async () => {
    setIsConnecting(true)
    try {
      const success = await WebRTCService.connectToCamera(cameraId, quality)
      if (!success) {
        Alert.alert("Connection Failed", "Unable to connect to camera")
        onClose()
      }
    } catch (error) {
      console.error("Camera connection error:", error)
      Alert.alert("Error", "Failed to connect to camera")
      onClose()
    }
  }

  const setupEventListeners = () => {
    WebRTCService.on("streamReceived", handleStreamReceived)
    WebRTCService.on("connectionStateChanged", handleConnectionStateChanged)
    WebRTCService.on("recordingStateChanged", handleRecordingStateChanged)
    WebRTCService.on("twoWayAudioEnabled", handleTwoWayAudioEnabled)
    WebRTCService.on("twoWayAudioDisabled", handleTwoWayAudioDisabled)
    WebRTCService.on("qualityChanged", handleQualityChanged)
  }

  const cleanup = () => {
    WebRTCService.off("streamReceived", handleStreamReceived)
    WebRTCService.off("connectionStateChanged", handleConnectionStateChanged)
    WebRTCService.off("recordingStateChanged", handleRecordingStateChanged)
    WebRTCService.off("twoWayAudioEnabled", handleTwoWayAudioEnabled)
    WebRTCService.off("twoWayAudioDisabled", handleTwoWayAudioDisabled)
    WebRTCService.off("qualityChanged", handleQualityChanged)

    WebRTCService.disconnectFromCamera(cameraId)
  }

  // Event handlers
  const handleStreamReceived = (data: { cameraId: string; stream: CameraStream }) => {
    if (data.cameraId === cameraId) {
      setCameraStream(data.stream)
      setIsConnecting(false)
    }
  }

  const handleConnectionStateChanged = (data: { cameraId: string; state: string; stream: CameraStream }) => {
    if (data.cameraId === cameraId) {
      setCameraStream(data.stream)
      setIsConnecting(data.state !== "connected")
    }
  }

  const handleRecordingStateChanged = (data: { cameraId: string; isRecording: boolean }) => {
    if (data.cameraId === cameraId) {
      setIsRecording(data.isRecording)
    }
  }

  const handleTwoWayAudioEnabled = (data: { cameraId: string }) => {
    if (data.cameraId === cameraId) {
      setIsTwoWayAudioEnabled(true)
    }
  }

  const handleTwoWayAudioDisabled = (data: { cameraId: string }) => {
    if (data.cameraId === cameraId) {
      setIsTwoWayAudioEnabled(false)
    }
  }

  const handleQualityChanged = (data: { cameraId: string; quality: "low" | "medium" | "high" }) => {
    if (data.cameraId === cameraId) {
      setQuality(data.quality)
    }
  }

  // Control functions
  const toggleRecording = async () => {
    if (isRecording) {
      await WebRTCService.stopRecording(cameraId)
    } else {
      await WebRTCService.startRecording(cameraId)
    }
  }

  const toggleTwoWayAudio = async () => {
    if (isTwoWayAudioEnabled) {
      await WebRTCService.disableTwoWayAudio(cameraId)
    } else {
      const success = await WebRTCService.enableTwoWayAudio(cameraId)
      if (!success) {
        Alert.alert("Error", "Failed to enable two-way audio. Please check microphone permissions.")
      }
    }
  }

  const changeQuality = async (newQuality: "low" | "medium" | "high") => {
    await WebRTCService.changeStreamQuality(cameraId, newQuality)
  }

  const toggleNightVision = async () => {
    const newState = !nightVisionEnabled
    await WebRTCService.toggleNightVision(cameraId, newState)
    setNightVisionEnabled(newState)
  }

  // PTZ gesture handlers
  const onPanGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent

    // Convert screen coordinates to PTZ values
    const panDelta = ((translationX - lastPanRef.current.x) / screenWidth) * 180 // -90 to +90 degrees
    const tiltDelta = ((translationY - lastPanRef.current.y) / screenHeight) * 90 // -45 to +45 degrees

    const newPan = Math.max(-90, Math.min(90, ptzPosition.pan + panDelta))
    const newTilt = Math.max(-45, Math.min(45, ptzPosition.tilt + tiltDelta))

    setPtzPosition((prev) => ({ ...prev, pan: newPan, tilt: newTilt }))

    lastPanRef.current = { x: translationX, y: translationY }
  }

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // Send PTZ command when gesture ends
      WebRTCService.panTiltZoom(cameraId, ptzPosition.pan, ptzPosition.tilt, ptzPosition.zoom)
      lastPanRef.current = { x: 0, y: 0 }
    }
  }

  const onPinchGestureEvent = (event: any) => {
    const { scale } = event.nativeEvent
    const newZoom = Math.max(1, Math.min(10, lastZoomRef.current * scale))
    setPtzPosition((prev) => ({ ...prev, zoom: newZoom }))
  }

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // Send zoom command when gesture ends
      WebRTCService.panTiltZoom(cameraId, ptzPosition.pan, ptzPosition.tilt, ptzPosition.zoom)
      lastZoomRef.current = ptzPosition.zoom
    }
  }

  const setPreset = (presetId: number) => {
    WebRTCService.setCameraPreset(cameraId, presetId)
  }

  const getQualityColor = (q: string) => {
    switch (q) {
      case "high":
        return "#10b981"
      case "medium":
        return "#f59e0b"
      case "low":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  return (
    <View style={styles.container}>
      {/* Video Stream */}
      <View style={styles.videoContainer}>
        {isConnecting ? (
          <View style={styles.loadingContainer}>
            <Icon name="videocam" size={60} color="#6b7280" />
            <Text style={styles.loadingText}>Connecting to {cameraName}...</Text>
          </View>
        ) : cameraStream?.stream ? (
          <PinchGestureHandler onGestureEvent={onPinchGestureEvent} onHandlerStateChange={onPinchHandlerStateChange}>
            <PanGestureHandler onGestureEvent={onPanGestureEvent} onHandlerStateChange={onPanHandlerStateChange}>
              <RTCView style={styles.videoStream} streamURL={cameraStream.stream.toURL()} objectFit="cover" />
            </PanGestureHandler>
          </PinchGestureHandler>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="videocam-off" size={60} color="#ef4444" />
            <Text style={styles.errorText}>No video signal</Text>
          </View>
        )}

        {/* Connection Status Indicator */}
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: cameraStream?.isConnected ? "#10b981" : "#ef4444" }]} />
          <Text style={styles.statusText}>{cameraStream?.isConnected ? "LIVE" : "DISCONNECTED"}</Text>
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>REC</Text>
          </View>
        )}

        {/* Quality Indicator */}
        <View style={[styles.qualityIndicator, { backgroundColor: getQualityColor(quality) }]}>
          <Text style={styles.qualityText}>{quality.toUpperCase()}</Text>
        </View>
      </View>

      {/* Controls Overlay */}
      {showControls && showControlsOverlay && (
        <View style={styles.controlsOverlay}>
          {/* Top Controls */}
          <LinearGradient colors={["rgba(0,0,0,0.8)", "transparent"]} style={styles.topControls}>
            <View style={styles.topControlsContent}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>{cameraName}</Text>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setShowControlsOverlay(!showControlsOverlay)}
              >
                <Icon name="more-vert" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Bottom Controls */}
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.bottomControls}>
            <View style={styles.bottomControlsContent}>
              {/* Main Controls Row */}
              <View style={styles.mainControlsRow}>
                <TouchableOpacity
                  style={[styles.controlButton, isRecording && styles.activeControlButton]}
                  onPress={toggleRecording}
                >
                  <Icon name="fiber-manual-record" size={24} color={isRecording ? "#ef4444" : "#ffffff"} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, isTwoWayAudioEnabled && styles.activeControlButton]}
                  onPress={toggleTwoWayAudio}
                >
                  <Icon name={isTwoWayAudioEnabled ? "mic" : "mic-off"} size={24} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, nightVisionEnabled && styles.activeControlButton]}
                  onPress={toggleNightVision}
                >
                  <Icon name="brightness-2" size={24} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton} onPress={() => {}}>
                  <Icon name="fullscreen" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Quality Controls */}
              <View style={styles.qualityControls}>
                {(["low", "medium", "high"] as const).map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.qualityButton, quality === q && styles.activeQualityButton]}
                    onPress={() => changeQuality(q)}
                  >
                    <Text style={[styles.qualityButtonText, quality === q && styles.activeQualityButtonText]}>
                      {q.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* PTZ Presets */}
              <View style={styles.presetControls}>
                <Text style={styles.presetLabel}>Presets:</Text>
                {[1, 2, 3, 4].map((preset) => (
                  <TouchableOpacity key={preset} style={styles.presetButton} onPress={() => setPreset(preset)}>
                    <Text style={styles.presetButtonText}>{preset}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* PTZ Info */}
      {showControls && (
        <View style={styles.ptzInfo}>
          <Text style={styles.ptzText}>
            Pan: {ptzPosition.pan.toFixed(1)}° | Tilt: {ptzPosition.tilt.toFixed(1)}° | Zoom:{" "}
            {ptzPosition.zoom.toFixed(1)}x
          </Text>
        </View>
      )}

      {/* Tap to show/hide controls */}
      <TouchableOpacity
        style={styles.tapOverlay}
        onPress={() => setShowControlsOverlay(!showControlsOverlay)}
        activeOpacity={1}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  videoContainer: {
    flex: 1,
    position: "relative",
  },
  videoStream: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
  },
  loadingText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginTop: 16,
  },
  statusIndicator: {
    position: "absolute",
    top: 60,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  recordingIndicator: {
    position: "absolute",
    top: 60,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  qualityIndicator: {
    position: "absolute",
    top: 100,
    right: 16,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none",
  },
  topControls: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  topControlsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    padding: 8,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
    textAlign: "center",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  bottomControlsContent: {
    alignItems: "center",
  },
  mainControlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeControlButton: {
    backgroundColor: "rgba(239,68,68,0.8)",
  },
  qualityControls: {
    flexDirection: "row",
    marginBottom: 12,
  },
  qualityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  activeQualityButton: {
    backgroundColor: "rgba(99,102,241,0.8)",
  },
  qualityButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  activeQualityButtonText: {
    color: "#ffffff",
  },
  presetControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  presetLabel: {
    fontSize: 12,
    color: "#ffffff",
    marginRight: 8,
  },
  presetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  ptzInfo: {
    position: "absolute",
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ptzText: {
    fontSize: 12,
    color: "#ffffff",
    textAlign: "center",
  },
  tapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
})

export default LiveCameraView
