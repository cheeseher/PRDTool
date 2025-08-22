import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DevAuthBypass, isDevelopment, DEV_MOCK_USERS, logDevInfo } from '../lib/devUtils'
import { useAuthStore } from '../store/authStore'

interface DevDebugPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function DevDebugPanel({ isOpen, onClose }: DevDebugPanelProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()
  const [bypassEnabled, setBypassEnabled] = useState(DevAuthBypass.isEnabled())
  const [currentMockUser, setCurrentMockUser] = useState(DevAuthBypass.getMockUser())
  
  useEffect(() => {
    setBypassEnabled(DevAuthBypass.isEnabled())
    setCurrentMockUser(DevAuthBypass.getMockUser())
  }, [isOpen])
  
  if (!isDevelopment() || !isOpen) {
    return null
  }
  
  const toggleBypass = () => {
    if (bypassEnabled) {
      DevAuthBypass.disable()
      setBypassEnabled(false)
      setCurrentMockUser(null)
      window.location.reload()
    } else {
      DevAuthBypass.enable()
      DevAuthBypass.setMockUser('admin')
      setBypassEnabled(true)
      setCurrentMockUser(DEV_MOCK_USERS.admin)
      window.location.reload()
    }
  }
  
  const switchUser = (userType: 'admin' | 'user') => {
    DevAuthBypass.setMockUser(userType)
    setCurrentMockUser(DEV_MOCK_USERS[userType])
    window.location.reload()
  }
  
  const quickNavigate = (path: string) => {
    navigate(path)
    onClose()
  }
  
  const clearAllData = () => {
    if (confirm('确定要清除所有开发数据吗？这将重置认证状态。')) {
      DevAuthBypass.clear()
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }
  
  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50" 
        onClick={onClose}
      />
      
      {/* 调试面板 */}
      <div className="fixed top-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="bg-orange-500 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="font-bold">开发者调试面板</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-orange-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* 环境信息 */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">环境信息</h4>
            <div className="text-sm space-y-1">
              <div>模式: <span className="font-mono bg-gray-200 px-1 rounded">{import.meta.env.MODE}</span></div>
              <div>主机: <span className="font-mono bg-gray-200 px-1 rounded">{window.location.hostname}</span></div>
              <div>当前路径: <span className="font-mono bg-gray-200 px-1 rounded">{location.pathname}</span></div>
            </div>
          </div>
          
          {/* 认证状态 */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">认证状态</h4>
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>认证绕过:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  bypassEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {bypassEnabled ? '✅ 已启用' : '❌ 已禁用'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>正常认证:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? '✅ 已认证' : '❌ 未认证'}
                </span>
              </div>
              
              {(currentMockUser || user) && (
                <div className="mt-2 p-2 bg-white rounded border">
                  <div className="text-xs text-gray-600">当前用户:</div>
                  <div className="font-medium">{(currentMockUser || user)?.name}</div>
                  <div className="text-xs text-gray-500">{(currentMockUser || user)?.email}</div>
                  <div className={`text-xs font-medium ${
                    (currentMockUser || user)?.is_admin ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    {(currentMockUser || user)?.is_admin ? '👑 管理员' : '👤 普通用户'}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 认证控制 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">认证控制</h4>
            
            <button
              onClick={toggleBypass}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                bypassEnabled 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {bypassEnabled ? '🔒 禁用认证绕过' : '🔓 启用认证绕过'}
            </button>
            
            {bypassEnabled && (
              <div className="space-y-2">
                <button
                  onClick={() => switchUser('admin')}
                  className="w-full py-2 px-3 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-sm font-medium transition-colors"
                >
                  👑 切换到管理员
                </button>
                
                <button
                  onClick={() => switchUser('user')}
                  className="w-full py-2 px-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                >
                  👤 切换到普通用户
                </button>
              </div>
            )}
          </div>
          
          {/* 快速导航 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">快速导航</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickNavigate('/admin/login')}
                className="py-2 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                🔑 登录页
              </button>
              
              <button
                onClick={() => quickNavigate('/admin/projects')}
                className="py-2 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                📁 项目管理
              </button>
            </div>
          </div>
          
          {/* 调试工具 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">调试工具</h4>
            
            <button
              onClick={() => {
                logDevInfo()
                alert('开发信息已输出到控制台')
              }}
              className="w-full py-2 px-3 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-sm font-medium transition-colors"
            >
              📊 输出调试信息
            </button>
            
            <button
              onClick={clearAllData}
              className="w-full py-2 px-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
            >
              🗑️ 清除所有数据
            </button>
          </div>
          
          {/* 快捷键提示 */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">快捷键</h4>
            <div className="text-xs space-y-1 text-gray-600">
              <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+Shift+D</kbd> 切换认证绕过</div>
              <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+Shift+P</kbd> 打开调试面板</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// 全局调试面板控制器
export function useDevDebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    if (!isDevelopment()) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P: 打开调试面板
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  }
}