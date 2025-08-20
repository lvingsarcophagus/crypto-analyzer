// Simple authentication system (can be replaced with real auth later)
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  created_at: string
  last_login: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

class AuthManager {
  private static instance: AuthManager
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }
  private listeners: ((state: AuthState) => void)[] = []

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.authState))
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.authState.isLoading = true
    this.notify()

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - in real app, this would call your auth API
    if (email === "admin@cryptorisk.com" && password === "admin123") {
      this.authState = {
        user: {
          id: "admin-1",
          email: "admin@cryptorisk.com",
          name: "Admin User",
          role: "admin",
          created_at: "2024-01-01T00:00:00Z",
          last_login: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
      }

      // Store in localStorage for persistence
      localStorage.setItem("auth_user", JSON.stringify(this.authState.user))
      this.notify()
      return { success: true }
    }

    this.authState.isLoading = false
    this.notify()
    return { success: false, error: "Invalid credentials" }
  }

  async logout(): Promise<void> {
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }
    localStorage.removeItem("auth_user")
    this.notify()
  }

  async checkAuth(): Promise<void> {
    this.authState.isLoading = true
    this.notify()

    // Check localStorage for existing session
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        this.authState = {
          user,
          isAuthenticated: true,
          isLoading: false,
        }
      } catch (error) {
        localStorage.removeItem("auth_user")
      }
    } else {
      this.authState.isLoading = false
    }

    this.notify()
  }

  getAuthState(): AuthState {
    return this.authState
  }
}

export const authManager = AuthManager.getInstance()
