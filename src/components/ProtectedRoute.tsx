import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { DevAuthBypass, isDevelopment } from '../lib/devUtils'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, initialize } = useAuthStore()
  const location = useLocation()
  
  useEffect(() => {
    initialize()
  }, [])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  // 开发环境认证绕过检查
  if (isDevelopment() && DevAuthBypass.isEnabled()) {
    const mockUser = DevAuthBypass.getMockUser()
    if (mockUser) {
      // 检查管理员权限
      if (requireAdmin && !mockUser.is_admin) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h1>
              <p className="text-gray-600">您没有权限访问此页面。</p>
              <p className="text-sm text-orange-600 mt-2">🛠️ 开发模式：当前模拟用户无管理员权限</p>
            </div>
          </div>
        )
      }
      
      // 开发环境直接通过认证
      return (
        <>
          {isDevelopment() && (
            <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-1 text-sm z-50">
              🛠️ 开发模式 - 认证已绕过 | 模拟用户: {mockUser.name} ({mockUser.is_admin ? '管理员' : '普通用户'}) | 按 Ctrl+Shift+D 切换
            </div>
          )}
          <div className={isDevelopment() ? 'pt-8' : ''}>
            {children}
          </div>
        </>
      )
    }
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  
  if (requireAdmin && !user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h1>
          <p className="text-gray-600">您没有权限访问此页面。</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}