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
  // 获取应用URL，优先使用环境变量，回退到当前域名
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/admin/projects`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
  
  if (error) throw error
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

// 登出
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // 直接返回Supabase Auth用户信息，添加管理员标识
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email || '',
    is_admin: user.user_metadata?.is_admin || false,
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