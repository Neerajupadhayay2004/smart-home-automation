import type React from "react"
import { View, StyleSheet } from "react-native"

interface ProgressBarProps {
  progress: number // 0-100
  color: string
  height?: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color, height = 4 }) => {
  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(100, Math.max(0, progress))}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 2,
  },
})
