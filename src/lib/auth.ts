import { supabase } from './supabase'
import type { User } from './supabase'

// 登录
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

// Google OAuth登录
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/admin/login`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
  
  if (error) {
    throw error
  }
  
  return data
}

// 注册
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        is_admin: false
      }
    }
  })
  
  if (error) throw error
  return data
}

// 自动设置Google用户为管理员
export async function ensureGoogleUserIsAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user && user.app_metadata?.provider === 'google') {
    // 检查用户是否已经是管理员
    if (!user.user_metadata?.is_admin) {
      // 设置Google用户为管理员
      const { error } = await supabase.auth.updateUser({
        data: {
          is_admin: true
        }
      })
      
      if (error) {
        console.error('Error setting Google user as admin:', error)
      }
    }
  }
}

// 登出
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // 如果是Google用户，自动设置为管理员
  let isAdmin = user.user_metadata?.is_admin || false
  if (user.app_metadata?.provider === 'google' && !isAdmin) {
    await ensureGoogleUserIsAdmin()
    isAdmin = true
  }
  
  // 直接返回Supabase Auth用户信息，添加管理员标识
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email || '',
    is_admin: isAdmin,
    created_at: user.created_at,
    updated_at: user.updated_at
  }
}

// 检查是否为管理员
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.is_admin || false
}

// 设置用户为管理员
export async function setUserAsAdmin(userId?: string) {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      is_admin: true
    }
  })
  
  if (error) throw error
  return data
}

// 监听认证状态变化
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}