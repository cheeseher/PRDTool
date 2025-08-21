import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { getProjectByToken, verifyProjectPassword, getProjectTabs } from '../lib/projects'
import type { Project, Tab } from '../lib/supabase'

export function ProjectAccess() {
  const { token } = useParams<{ token: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTab, setActiveTab] = useState<Tab | null>(null)
  const [password, setPassword] = useState('')
  const [isPasswordRequired, setIsPasswordRequired] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [visibleTabs, setVisibleTabs] = useState<Tab[]>([])
  const [hiddenTabs, setHiddenTabs] = useState<Tab[]>([])
  const [iframeError, setIframeError] = useState<string>('')
  const [iframeLoading, setIframeLoading] = useState<boolean>(false)
  
  useEffect(() => {
    if (token) {
      loadProject()
    }
  }, [token])
  
  useEffect(() => {
    // 计算可见和隐藏的标签页
    if (tabs.length > 0) {
      // 简单的实现：前5个标签页可见，其余隐藏
      const maxVisible = 5
      setVisibleTabs(tabs.slice(0, maxVisible))
      setHiddenTabs(tabs.slice(maxVisible))
      
      // 设置默认激活的标签页
      if (!activeTab && tabs.length > 0) {
        setActiveTab(tabs[0])
      }
    }
  }, [tabs, activeTab])
  
  const loadProject = async () => {
    if (!token) return
    
    setIsLoading(true)
    try {
      const projectData = await getProjectByToken(token)
      if (!projectData) {
        setError('项目不存在或访问链接无效')
        return
      }
      
      setProject(projectData)
      
      // 检查是否需要密码
      if (projectData.password) {
        setIsPasswordRequired(true)
      } else {
        await loadProjectTabs(projectData.id)
      }
    } catch (err) {
      setError('加载项目失败')
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadProjectTabs = async (projectId: string) => {
    try {
      const tabsData = await getProjectTabs(projectId)
      setTabs(tabsData)
    } catch (err) {
      console.error('Error loading tabs:', err)
    }
  }
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    
    setIsVerifying(true)
    setError('')
    
    try {
      const isValid = await verifyProjectPassword(project.id, password)
      if (isValid) {
        setIsPasswordRequired(false)
        await loadProjectTabs(project.id)
      } else {
        setError('密码错误，请重试')
      }
    } catch (err) {
      setError('验证失败，请重试')
    } finally {
      setIsVerifying(false)
    }
  }
  
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab)
    setShowDropdown(false)
    setIframeError('')
    setIframeLoading(true)
  }
  
  const handleIframeLoad = () => {
    setIframeLoading(false)
    setIframeError('')
  }
  
  const handleIframeError = () => {
    setIframeLoading(false)
    setIframeError('无法加载此页面，可能是网络问题或目标网站不允许嵌入显示')
  }
  
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">访问失败</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }
  
  if (isPasswordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{project?.name}</h2>
            <p className="mt-2 text-sm text-gray-600">此项目需要密码访问</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                访问密码
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入访问密码"
              />
            </div>
            
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isVerifying ? '验证中...' : '访问项目'}
            </button>
          </form>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="bg-gray-800 h-16">
        <div className="max-w-full mx-auto px-2 sm:px-4 h-full">
          <div className="flex items-center h-full">
            {/* 项目名称 */}
            <div className="flex-shrink-0 w-32 sm:w-40 md:w-48">
              <h1 className="text-white text-sm sm:text-base md:text-lg font-medium truncate" title={project?.name}>
                {project?.name}
              </h1>
            </div>
            
            {/* 标签页区域 */}
            <div className="flex-1 flex items-center justify-center px-2 sm:px-4 overflow-hidden">
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                {/* 可见标签页 */}
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`flex-shrink-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                      activeTab?.id === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
                
                {/* 下拉菜单按钮 */}
                {hiddenTabs.length > 0 && (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors whitespace-nowrap"
                    >
                      更多
                      <ChevronDownIcon className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    
                    {showDropdown && (
                      <div className="absolute top-full right-0 mt-1 w-40 sm:w-48 bg-white rounded-md shadow-lg z-50">
                        <div className="py-1">
                          {hiddenTabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => handleTabClick(tab)}
                              className={`block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors ${
                                activeTab?.id === tab.id
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {tab.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* 右侧占位 */}
            <div className="hidden sm:block flex-shrink-0 w-32 md:w-48"></div>
          </div>
        </div>
      </nav>
      
      {/* 内容区域 */}
      <div className="h-[calc(100vh-4rem)]">
        {activeTab ? (
          <div className="w-full h-full relative">
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">正在加载 {activeTab.name}...</p>
                </div>
              </div>
            )}
            
            {iframeError ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                  <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">页面加载失败</h3>
                  <p className="text-sm text-gray-600 mb-4">{iframeError}</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIframeError('')
                        setIframeLoading(true)
                        // 强制重新加载iframe
                        const iframe = document.querySelector('iframe')
                        if (iframe) {
                          iframe.src = iframe.src
                        }
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      重新加载
                    </button>
                    <button
                      onClick={() => openInNewTab(activeTab.url)}
                      className="w-full px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      在新标签页中打开
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    目标地址: <span className="font-mono">{activeTab.url}</span>
                  </p>
                </div>
              </div>
            ) : (
              <iframe
                src={activeTab.url}
                className="w-full h-full border-0"
                title={activeTab.name}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">欢迎访问 {project?.name}</h3>
              {tabs.length === 0 ? (
                <p className="text-gray-600">暂无可用的标签页</p>
              ) : (
                <p className="text-gray-600">请选择一个标签页开始浏览</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 点击外部关闭下拉菜单 */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}