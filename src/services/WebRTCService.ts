import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  type MediaStream,
  mediaDevices,
  type RTCDataChannel,
} from "react-native-webrtc"
import io, { type Socket } from "socket.io-client"

export interface CameraStream {
  id: string
  name: string
  stream: MediaStream | null
  isConnected: boolean
  quality: "low" | "medium" | "high"
  hasAudio: boolean
  isRecording: boolean
}

export interface WebRTCConfig {
  iceServers: Array<{
    urls: string[]
    username?: string
    credential?: string
  }>
}

class WebRTCService {
  private socket: Socket | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private localStream: MediaStream | null = null
  private cameraStreams: Map<string, CameraStream> = new Map()
  private dataChannels: Map<string, RTCDataChannel> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()

  private config: WebRTCConfig = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
      {
        urls: ["turn:your-turn-server.com:3478"],
        username: "your-username",
        credential: "your-password",
      },
    ],
  }

  constructor() {
    this.initializeSocket()
  }

  private initializeSocket() {
    this.socket = io("wss://your-smart-home-server.com", {
      transports: ["websocket"],
    })

    this.socket.on("connect", () => {
      console.log("WebRTC Socket connected")
      this.emit("socketConnected")
    })

    this.socket.on("disconnect", () => {
      console.log("WebRTC Socket disconnected")
      this.emit("socketDisconnected")
    })

    this.socket.on("camera-offer", this.handleCameraOffer.bind(this))
    this.socket.on("camera-answer", this.handleCameraAnswer.bind(this))
    this.socket.on("ice-candidate", this.handleIceCandidate.bind(this))
    this.socket.on("camera-disconnected", this.handleCameraDisconnected.bind(this))
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => callback(data))
    }
  }

  // Connect to a specific camera
  async connectToCamera(cameraId: string, quality: "low" | "medium" | "high" = "medium"): Promise<boolean> {
    try {
      console.log(`Connecting to camera ${cameraId} with quality ${quality}`)

      // Create peer connection
      const peerConnection = new RTCPeerConnection(this.config)
      this.peerConnections.set(cameraId, peerConnection)

      // Set up event handlers
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.socket) {
          this.socket.emit("ice-candidate", {
            cameraId,
            candidate: event.candidate,
          })
        }
      }

      peerConnection.onaddstream = (event) => {
        console.log(`Received stream from camera ${cameraId}`)
        this.handleRemoteStream(cameraId, event.stream)
      }

      peerConnection.onconnectionstatechange = () => {
        console.log(`Camera ${cameraId} connection state: ${peerConnection.connectionState}`)
        this.updateCameraConnectionState(cameraId, peerConnection.connectionState)
      }

      // Create data channel for camera controls
      const dataChannel = peerConnection.createDataChannel("cameraControl", {
        ordered: true,
      })

      dataChannel.onopen = () => {
        console.log(`Data channel opened for camera ${cameraId}`)
      }

      dataChannel.onmessage = (event) => {
        this.handleDataChannelMessage(cameraId, event.data)
      }

      this.dataChannels.set(cameraId, dataChannel)

      // Request camera stream from server
      if (this.socket) {
        this.socket.emit("request-camera-stream", {
          cameraId,
          quality,
          requestAudio: true,
        })
      }

      return true
    } catch (error) {
      console.error(`Failed to connect to camera ${cameraId}:`, error)
      return false
    }
  }

  // Disconnect from camera
  async disconnectFromCamera(cameraId: string) {
    try {
      const peerConnection = this.peerConnections.get(cameraId)
      if (peerConnection) {
        peerConnection.close()
        this.peerConnections.delete(cameraId)
      }

      const dataChannel = this.dataChannels.get(cameraId)
      if (dataChannel) {
        dataChannel.close()
        this.dataChannels.delete(cameraId)
      }

      this.cameraStreams.delete(cameraId)

      if (this.socket) {
        this.socket.emit("disconnect-camera", { cameraId })
      }

      this.emit("cameraDisconnected", { cameraId })
    } catch (error) {
      console.error(`Failed to disconnect from camera ${cameraId}:`, error)
    }
  }

  // Handle incoming camera offer
  private async handleCameraOffer(data: { cameraId: string; offer: RTCSessionDescription }) {
    try {
      const { cameraId, offer } = data
      const peerConnection = this.peerConnections.get(cameraId)

      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)

        if (this.socket) {
          this.socket.emit("camera-answer", {
            cameraId,
            answer: answer,
          })
        }
      }
    } catch (error) {
      console.error("Failed to handle camera offer:", error)
    }
  }

  // Handle incoming camera answer
  private async handleCameraAnswer(data: { cameraId: string; answer: RTCSessionDescription }) {
    try {
      const { cameraId, answer } = data
      const peerConnection = this.peerConnections.get(cameraId)

      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      }
    } catch (error) {
      console.error("Failed to handle camera answer:", error)
    }
  }

  // Handle ICE candidates
  private async handleIceCandidate(data: { cameraId: string; candidate: RTCIceCandidate }) {
    try {
      const { cameraId, candidate } = data
      const peerConnection = this.peerConnections.get(cameraId)

      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      }
    } catch (error) {
      console.error("Failed to handle ICE candidate:", error)
    }
  }

  // Handle remote stream
  private handleRemoteStream(cameraId: string, stream: MediaStream) {
    const cameraStream: CameraStream = {
      id: cameraId,
      name: `Camera ${cameraId}`,
      stream,
      isConnected: true,
      quality: "medium",
      hasAudio: stream.getAudioTracks().length > 0,
      isRecording: false,
    }

    this.cameraStreams.set(cameraId, cameraStream)
    this.emit("streamReceived", { cameraId, stream: cameraStream })
  }

  // Handle camera disconnection
  private handleCameraDisconnected(data: { cameraId: string }) {
    this.disconnectFromCamera(data.cameraId)
  }

  // Update camera connection state
  private updateCameraConnectionState(cameraId: string, state: string) {
    const cameraStream = this.cameraStreams.get(cameraId)
    if (cameraStream) {
      cameraStream.isConnected = state === "connected"
      this.emit("connectionStateChanged", { cameraId, state, stream: cameraStream })
    }
  }

  // Handle data channel messages
  private handleDataChannelMessage(cameraId: string, message: string) {
    try {
      const data = JSON.parse(message)
      this.emit("cameraMessage", { cameraId, data })
    } catch (error) {
      console.error("Failed to parse data channel message:", error)
    }
  }

  // Camera controls
  async panTiltZoom(cameraId: string, pan: number, tilt: number, zoom: number) {
    const dataChannel = this.dataChannels.get(cameraId)
    if (dataChannel && dataChannel.readyState === "open") {
      const command = {
        type: "ptz",
        pan,
        tilt,
        zoom,
        timestamp: Date.now(),
      }
      dataChannel.send(JSON.stringify(command))
    }
  }

  async setCameraPreset(cameraId: string, presetId: number) {
    const dataChannel = this.dataChannels.get(cameraId)
    if (dataChannel && dataChannel.readyState === "open") {
      const command = {
        type: "preset",
        presetId,
        timestamp: Date.now(),
      }
      dataChannel.send(JSON.stringify(command))
    }
  }

  async toggleNightVision(cameraId: string, enabled: boolean) {
    const dataChannel = this.dataChannels.get(cameraId)
    if (dataChannel && dataChannel.readyState === "open") {
      const command = {
        type: "nightVision",
        enabled,
        timestamp: Date.now(),
      }
      dataChannel.send(JSON.stringify(command))
    }
  }

  async startRecording(cameraId: string) {
    const dataChannel = this.dataChannels.get(cameraId)
    if (dataChannel && dataChannel.readyState === "open") {
      const command = {
        type: "recording",
        action: "start",
        timestamp: Date.now(),
      }
      dataChannel.send(JSON.stringify(command))

      const cameraStream = this.cameraStreams.get(cameraId)
      if (cameraStream) {
        cameraStream.isRecording = true
        this.emit("recordingStateChanged", { cameraId, isRecording: true })
      }
    }
  }

  async stopRecording(cameraId: string) {
    const dataChannel = this.dataChannels.get(cameraId)
    if (dataChannel && dataChannel.readyState === "open") {
      const command = {
        type: "recording",
        action: "stop",
        timestamp: Date.now(),
      }
      dataChannel.send(JSON.stringify(command))

      const cameraStream = this.cameraStreams.get(cameraId)
      if (cameraStream) {
        cameraStream.isRecording = false
        this.emit("recordingStateChanged", { cameraId, isRecording: false })
      }
    }
  }

  // Two-way audio
  async enableTwoWayAudio(cameraId: string): Promise<boolean> {
    try {
      // Request microphone permission and get local audio stream
      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      this.localStream = stream
      const peerConnection = this.peerConnections.get(cameraId)

      if (peerConnection) {
        // Add local audio track to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream)
        })

        this.emit("twoWayAudioEnabled", { cameraId })
        return true
      }

      return false
    } catch (error) {
      console.error("Failed to enable two-way audio:", error)
      return false
    }
  }

  async disableTwoWayAudio(cameraId: string) {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.localStream = null
    }

    const peerConnection = this.peerConnections.get(cameraId)
    if (peerConnection) {
      // Remove local tracks
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track) {
          peerConnection.removeTrack(sender)
        }
      })
    }

    this.emit("twoWayAudioDisabled", { cameraId })
  }

  // Quality control
  async changeStreamQuality(cameraId: string, quality: "low" | "medium" | "high") {
    const dataChannel = this.dataChannels.get(cameraId)
    if (dataChannel && dataChannel.readyState === "open") {
      const command = {
        type: "quality",
        quality,
        timestamp: Date.now(),
      }
      dataChannel.send(JSON.stringify(command))

      const cameraStream = this.cameraStreams.get(cameraId)
      if (cameraStream) {
        cameraStream.quality = quality
        this.emit("qualityChanged", { cameraId, quality })
      }
    }
  }

  // Get camera stream
  getCameraStream(cameraId: string): CameraStream | null {
    return this.cameraStreams.get(cameraId) || null
  }

  // Get all camera streams
  getAllCameraStreams(): CameraStream[] {
    return Array.from(this.cameraStreams.values())
  }

  // Cleanup
  async cleanup() {
    // Close all peer connections
    this.peerConnections.forEach((pc, cameraId) => {
      pc.close()
    })
    this.peerConnections.clear()

    // Close all data channels
    this.dataChannels.forEach((dc, cameraId) => {
      dc.close()
    })
    this.dataChannels.clear()

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.localStream = null
    }

    // Clear camera streams
    this.cameraStreams.clear()

    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    // Clear event listeners
    this.eventListeners.clear()
  }
}

export default new WebRTCService()
