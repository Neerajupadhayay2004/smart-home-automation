"use client"

import { useState, useEffect, useCallback } from "react"
import WebRTCService, { type CameraStream } from "../services/WebRTCService"

export const useWebRTC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [cameraStreams, setCameraStreams] = useState<CameraStream[]>([])
  const [connectionState, setConnectionState] = useState<"disconnected" | "connecting" | "connected">("disconnected")

  useEffect(() => {
    const handleSocketConnected = () => {
      setIsConnected(true)
      setConnectionState("connected")
    }

    const handleSocketDisconnected = () => {
      setIsConnected(false)
      setConnectionState("disconnected")
    }

    const handleStreamReceived = (data: { cameraId: string; stream: CameraStream }) => {
      setCameraStreams((prev) => {
        const filtered = prev.filter((s) => s.id !== data.cameraId)
        return [...filtered, data.stream]
      })
    }

    const handleCameraDisconnected = (data: { cameraId: string }) => {
      setCameraStreams((prev) => prev.filter((s) => s.id !== data.cameraId))
    }

    WebRTCService.on("socketConnected", handleSocketConnected)
    WebRTCService.on("socketDisconnected", handleSocketDisconnected)
    WebRTCService.on("streamReceived", handleStreamReceived)
    WebRTCService.on("cameraDisconnected", handleCameraDisconnected)

    return () => {
      WebRTCService.off("socketConnected", handleSocketConnected)
      WebRTCService.off("socketDisconnected", handleSocketDisconnected)
      WebRTCService.off("streamReceived", handleStreamReceived)
      WebRTCService.off("cameraDisconnected", handleCameraDisconnected)
    }
  }, [])

  const connectToCamera = useCallback(async (cameraId: string, quality: "low" | "medium" | "high" = "medium") => {
    setConnectionState("connecting")
    const success = await WebRTCService.connectToCamera(cameraId, quality)
    if (!success) {
      setConnectionState("disconnected")
    }
    return success
  }, [])

  const disconnectFromCamera = useCallback(async (cameraId: string) => {
    await WebRTCService.disconnectFromCamera(cameraId)
  }, [])

  const enableTwoWayAudio = useCallback(async (cameraId: string) => {
    return await WebRTCService.enableTwoWayAudio(cameraId)
  }, [])

  const disableTwoWayAudio = useCallback(async (cameraId: string) => {
    await WebRTCService.disableTwoWayAudio(cameraId)
  }, [])

  const startRecording = useCallback(async (cameraId: string) => {
    await WebRTCService.startRecording(cameraId)
  }, [])

  const stopRecording = useCallback(async (cameraId: string) => {
    await WebRTCService.stopRecording(cameraId)
  }, [])

  const panTiltZoom = useCallback(async (cameraId: string, pan: number, tilt: number, zoom: number) => {
    await WebRTCService.panTiltZoom(cameraId, pan, tilt, zoom)
  }, [])

  const changeQuality = useCallback(async (cameraId: string, quality: "low" | "medium" | "high") => {
    await WebRTCService.changeStreamQuality(cameraId, quality)
  }, [])

  const getCameraStream = useCallback((cameraId: string) => {
    return WebRTCService.getCameraStream(cameraId)
  }, [])

  return {
    isConnected,
    connectionState,
    cameraStreams,
    connectToCamera,
    disconnectFromCamera,
    enableTwoWayAudio,
    disableTwoWayAudio,
    startRecording,
    stopRecording,
    panTiltZoom,
    changeQuality,
    getCameraStream,
  }
}
