import { create } from 'zustand'
import type { User } from '../lib/supabase'
import { getCurrentUser, onAuthStateChange } from '../lib/auth'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  
  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    })
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading })
  },
  
  initialize: () => {
    set({ isLoading: true })
    
    // 获取当前用户
    getCurrentUser()
      .then((user) => {
        get().setUser(user)
      })
      .catch((error) => {
        console.error('Error initializing auth:', error)
        get().setUser(null)
      })
    
    // 监听认证状态变化
    onAuthStateChange((user) => {
      if (user) {
        getCurrentUser().then((userData) => {
          get().setUser(userData)
        })
      } else {
        get().setUser(null)
      }
    })
  },
  
  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false,
      isLoading: false 
    })
  }
}))