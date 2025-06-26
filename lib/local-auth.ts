export interface User {
  id: string
  name: string
  email: string
  role: string
  image?: string
  createdAt: string
}

interface StoredUser extends User {
  password: string
}

export class LocalAuth {
  private static readonly USERS_KEY = "smarthome_users"
  private static readonly CURRENT_USER_KEY = "smarthome_current_user"

  static initializeDefaultUsers(): void {
    const existingUsers = this.getStoredUsers()

    // Add default users if they don't exist
    const defaultUsers: StoredUser[] = [
      {
        id: "1",
        name: "Admin User",
        email: "admin@smarthome.com",
        password: "password123",
        role: "Administrator",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Demo User",
        email: "demo@smarthome.com",
        password: "demo123",
        role: "User",
        createdAt: new Date().toISOString(),
      },
    ]

    const usersToAdd = defaultUsers.filter(
      (defaultUser) => !existingUsers.some((user) => user.email === defaultUser.email),
    )

    if (usersToAdd.length > 0) {
      const updatedUsers = [...existingUsers, ...usersToAdd]
      localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers))
    }
  }

  static getStoredUsers(): StoredUser[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY)
      return users ? JSON.parse(users) : []
    } catch (error) {
      console.error("Error reading users from localStorage:", error)
      return []
    }
  }

  static saveUsers(users: StoredUser[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    } catch (error) {
      console.error("Error saving users to localStorage:", error)
    }
  }

  static login(email: string, password: string): { success: boolean; message: string; user?: User } {
    try {
      const users = this.getStoredUsers()
      const user = users.find((u) => u.email === email && u.password === password)

      if (user) {
        const userWithoutPassword: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          createdAt: user.createdAt,
        }

        this.setCurrentUser(userWithoutPassword)
        return {
          success: true,
          message: "Login successful",
          user: userWithoutPassword,
        }
      } else {
        return {
          success: false,
          message: "Invalid email or password",
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "Login failed. Please try again.",
      }
    }
  }

  static register(name: string, email: string, password: string): { success: boolean; message: string; user?: User } {
    try {
      const users = this.getStoredUsers()

      // Check if user already exists
      if (users.some((u) => u.email === email)) {
        return {
          success: false,
          message: "User with this email already exists",
        }
      }

      const newUser: StoredUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: "User",
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))

      const userWithoutPassword: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image,
        createdAt: newUser.createdAt,
      }

      return {
        success: true,
        message: "Registration successful",
        user: userWithoutPassword,
      }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: "Registration failed. Please try again.",
      }
    }
  }

  static getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem(this.CURRENT_USER_KEY)
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error("Error reading current user:", error)
      return null
    }
  }

  static setCurrentUser(user: User): void {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
    } catch (error) {
      console.error("Error setting current user:", error)
    }
  }

  static logout(): void {
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(this.USERS_KEY)
      localStorage.removeItem(this.CURRENT_USER_KEY)
    } catch (error) {
      console.error("Error clearing data:", error)
    }
  }
}
