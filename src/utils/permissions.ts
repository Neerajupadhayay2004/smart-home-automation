import { Platform } from "react-native"
import { request, PERMISSIONS, RESULTS, type Permission } from "react-native-permissions"

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission: Permission = Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA

    const result = await request(permission)
    return result === RESULTS.GRANTED
  } catch (error) {
    console.error("Camera permission error:", error)
    return false
  }
}

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const permission: Permission = Platform.OS === "ios" ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO

    const result = await request(permission)
    return result === RESULTS.GRANTED
  } catch (error) {
    console.error("Microphone permission error:", error)
    return false
  }
}

export const requestAllMediaPermissions = async (): Promise<{ camera: boolean; microphone: boolean }> => {
  const [camera, microphone] = await Promise.all([requestCameraPermission(), requestMicrophonePermission()])

  return { camera, microphone }
}
