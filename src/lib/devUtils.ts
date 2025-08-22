// 开发环境工具模块
// 仅在开发环境中使用，生产环境会被完全移除

/**
 * 检测是否为开发环境
 */
export const isDevelopment = (): boolean => {
  // 生产环境强制返回false
  if (import.meta.env.PROD && !import.meta.env.DEV) {
    return false
  }
  
  return (
    import.meta.env.DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost')
  )
}

/**
 * 检测是否为生产环境
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD && !isDevelopment()
}

/**
 * 开发环境用户数据
 */
export const DEV_MOCK_USERS = {
  admin: {
    id: 'dev-admin-001',
    email: 'dev-admin@localhost.com',
    name: '开发管理员',
    is_admin: true,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  user: {
    id: 'dev-user-001',
    email: 'dev-user@localhost.com',
    name: '开发用户',
    is_admin: false,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

/**
 * 开发环境认证绕过功能
 */
export class DevAuthBypass {
  private static readonly STORAGE_KEY = 'dev_auth_bypass'
  private static readonly USER_KEY = 'dev_mock_user'
  
  /**
   * 检查是否启用了开发环境认证绕过
   */
  static isEnabled(): boolean {
    // 生产环境强制禁用
    if (isProduction()) {
      // 清理可能残留的开发数据
      this.clear()
      return false
    }
    
    if (!isDevelopment()) return false
    return localStorage.getItem(this.STORAGE_KEY) === 'true'
  }
  
  /**
   * 启用开发环境认证绕过
   */
  static enable(): void {
    if (isProduction()) {
      console.error('🚫 生产环境禁止使用认证绕过功能')
      return
    }
    
    if (!isDevelopment()) {
      console.warn('认证绕过功能仅在开发环境可用')
      return
    }
    localStorage.setItem(this.STORAGE_KEY, 'true')
    console.log('🔓 开发环境认证绕过已启用')
  }
  
  /**
   * 禁用开发环境认证绕过
   */
  static disable(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.USER_KEY)
    console.log('🔒 开发环境认证绕过已禁用')
  }
  
  /**
   * 设置模拟用户
   */
  static setMockUser(userType: 'admin' | 'user'): void {
    if (isProduction()) {
      console.error('🚫 生产环境禁止使用模拟用户功能')
      return
    }
    
    if (!isDevelopment()) return
    
    const mockUser = DEV_MOCK_USERS[userType]
    localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser))
    console.log(`👤 已设置模拟用户: ${mockUser.name} (${userType})`)
  }
  
  /**
   * 获取模拟用户
   */
  static getMockUser(): any | null {
    if (isProduction()) {
      // 生产环境清理数据并返回null
      this.clear()
      return null
    }
    
    if (!isDevelopment() || !this.isEnabled()) return null
    
    const userData = localStorage.getItem(this.USER_KEY)
    if (!userData) {
      // 默认使用管理员用户
      this.setMockUser('admin')
      return DEV_MOCK_USERS.admin
    }
    
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }
  
  /**
   * 清除所有开发数据
   */
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.USER_KEY)
  }
}

/**
 * 开发环境调试信息
 */
export const logDevInfo = () => {
  if (!isDevelopment()) return
  
  console.group('🛠️ 开发环境信息')
  console.log('环境:', import.meta.env.MODE)
  console.log('主机:', window.location.hostname)
  console.log('认证绕过:', DevAuthBypass.isEnabled() ? '✅ 已启用' : '❌ 已禁用')
  
  if (DevAuthBypass.isEnabled()) {
    const mockUser = DevAuthBypass.getMockUser()
    console.log('模拟用户:', mockUser?.name || '未设置')
    console.log('用户角色:', mockUser?.is_admin ? '管理员' : '普通用户')
  }
  
  console.groupEnd()
}

// 开发环境快捷键和初始化
if (isDevelopment() && !isProduction()) {
  // Ctrl/Cmd + Shift + D: 切换认证绕过
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
      e.preventDefault()
      
      if (DevAuthBypass.isEnabled()) {
        DevAuthBypass.disable()
        window.location.reload()
      } else {
        DevAuthBypass.enable()
        DevAuthBypass.setMockUser('admin')
        window.location.reload()
      }
    }
  })
  
  // 页面加载时显示开发信息
  window.addEventListener('load', () => {
    setTimeout(logDevInfo, 1000)
  })
} else if (isProduction()) {
  // 生产环境清理所有开发数据
  DevAuthBypass.clear()
}