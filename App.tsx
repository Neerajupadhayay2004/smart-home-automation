"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import PushNotification from "react-native-push-notification"
import io from "socket.io-client"

// Screens
import HomeScreen from "./src/screens/HomeScreen"
import SecurityScreen from "./src/screens/SecurityScreen"
import EnergyScreen from "./src/screens/EnergyScreen"
import EnvironmentScreen from "./src/screens/EnvironmentScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import LoginScreen from "./src/screens/LoginScreen"
import CameraDetailScreen from "./src/screens/CameraDetailScreen"
import DeviceControlScreen from "./src/screens/DeviceControlScreen"

// Context
import { SmartHomeProvider } from "./src/context/SmartHomeContext"
import { AuthProvider, useAuth } from "./src/context/AuthContext"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          switch (route.name) {
            case "Home":
              iconName = "home"
              break
            case "Security":
              iconName = "security"
              break
            case "Energy":
              iconName = "flash-on"
              break
            case "Environment":
              iconName = "eco"
              break
            case "Settings":
              iconName = "settings"
              break
            default:
              iconName = "home"
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Security" component={SecurityScreen} />
      <Tab.Screen name="Energy" component={EnergyScreen} />
      <Tab.Screen name="Environment" component={EnvironmentScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

const AppNavigator = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="CameraDetail" component={CameraDetailScreen} />
          <Stack.Screen name="DeviceControl" component={DeviceControlScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    // Initialize push notifications
    PushNotification.configure({
      onNotification: (notification) => {
        console.log("NOTIFICATION:", notification)
        if (notification.userInteraction) {
          // Handle notification tap
        }
      },
      requestPermissions: true,
    })

    // Connect to WebSocket for real-time updates
    const socketConnection = io("ws://your-smart-home-server.com")
    setSocket(socketConnection)

    socketConnection.on("connect", () => {
      console.log("Connected to smart home server")
    })

    socketConnection.on("alert", (data) => {
      PushNotification.localNotification({
        title: "Smart Home Alert",
        message: data.message,
        priority: data.severity === "critical" ? "high" : "default",
      })
    })

    return () => {
      socketConnection.disconnect()
    }
  }, [])

  return (
    <AuthProvider>
      <SmartHomeProvider socket={socket}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <AppNavigator />
        </NavigationContainer>
      </SmartHomeProvider>
    </AuthProvider>
  )
}
