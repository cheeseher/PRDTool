import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 数据库类型定义
export interface User {
  id: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  password?: string
  token: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Tab {
  id: string
  project_id: string
  name: string
  url: string
  order_index: number
  is_visible: boolean
  created_at: string
  updated_at: string
}