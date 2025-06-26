import type React from "react"
import { TouchableOpacity, Text, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

interface QuickActionButtonProps {
  title: string
  icon: string
  color: string
  onPress: () => void
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ title, icon, color, onPress }) => {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
      <Icon name={icon} size={24} color="#ffffff" />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: "48%",
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
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 8,
    textAlign: "center",
  },
})

export default QuickActionButton
