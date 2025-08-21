import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronDownIcon, Cog6ToothIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { signOut } from '../lib/auth'
import type { Tab } from '../lib/supabase'

export function MainWorkspace() {
  const { id } = useParams<{ id: string }>()
  const { 
    projects, 
    currentProject, 
    currentTabs, 
    isLoading, 
    fetchProjects, 
    fetchProject, 
    fetchProjectTabs 
  } = useProjectStore()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab | null>(null)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showTabDropdown, setShowTabDropdown] = useState(false)
  const [visibleTabs, setVisibleTabs] = useState<Tab[]>([])
  const [hiddenTabs, setHiddenTabs] = useState<Tab[]>([])
  
  useEffect(() => {
    fetchProjects()
    if (id) {
      fetchProject(id)
      fetchProjectTabs(id)
    }
  }, [id])
  
  useEffect(() => {
    // 计算可见和隐藏的标签页
    if (currentTabs.length > 0) {
      const maxVisible = 5
      setVisibleTabs(currentTabs.slice(0, maxVisible))
      setHiddenTabs(currentTabs.slice(maxVisible))
      
      if (!activeTab && currentTabs.length > 0) {
        setActiveTab(currentTabs[0])
      }
    }
  }, [currentTabs, activeTab])
  
  const handleLogout = async () => {
    try {
      await signOut()
      logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab)
    setShowTabDropdown(false)
  }
  
  const copyAccessLink = () => {
    if (currentProject) {
      const link = `${window.location.origin}/access/${currentProject.token}`
      navigator.clipboard.writeText(link)
      alert('访问链接已复制到剪贴板')
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载中</h3>
          <p className="text-gray-600">正在为您准备工作空间...</p>
        </div>
      </div>
    )
  }
  
  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">项目不存在</h1>
          <Link
            to="/admin/projects"
            className="text-blue-600 hover:text-blue-500"
          >
            返回项目列表
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 导航栏 */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 h-16 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-2 sm:px-4 h-full">
          <div className="flex items-center h-full">
            {/* 左侧：项目切换器 */}
            <div className="flex-shrink-0 w-28 sm:w-40 md:w-48">
              <div className="relative">
                <button
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="flex items-center px-2 sm:px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors w-full border border-gray-200 bg-white/80"
                >
                  <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md sm:rounded-lg flex items-center justify-center mr-1 sm:mr-2">
                    <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="truncate text-xs sm:text-sm font-medium" title={currentProject.name}>
                    {currentProject.name}
                  </span>
                  <ChevronDownIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-gray-400" />
                </button>
                
                {showProjectDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg z-50">
                    <div className="py-1">
                      {projects.map((project) => (
                        <Link
                          key={project.id}
                          to={`/project/${project.id}`}
                          onClick={() => setShowProjectDropdown(false)}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            project.id === currentProject.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium">{project.name}</div>
                          {project.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {project.description}
                            </div>
                          )}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100">
                        <Link
                          to="/admin/projects"
                          onClick={() => setShowProjectDropdown(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          管理所有项目
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 中间：标签页 */}
            <div className="flex-1 flex items-center justify-center px-2 sm:px-4 overflow-hidden">
              <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`flex-shrink-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-200 whitespace-nowrap ${
                      activeTab?.id === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 border border-gray-200 bg-white/60'
                    }`}
                  >
                    <span className="truncate max-w-20 sm:max-w-none">{tab.name}</span>
                  </button>
                ))}
                
                {hiddenTabs.length > 0 && (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowTabDropdown(!showTabDropdown)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white/80 hover:text-gray-900 rounded-xl transition-all duration-200 whitespace-nowrap border border-gray-200 bg-white/60"
                    >
                      更多
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    </button>
                    
                    {showTabDropdown && (
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
                
                {/* 添加标签页按钮 */}
                <Link
                  to={`/project/${currentProject.id}/manage`}
                  className="flex-shrink-0 flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white/80 hover:text-gray-900 rounded-xl transition-all duration-200 border border-gray-200 bg-white/60 hover:shadow-md"
                  title="管理标签页"
                >
                  <PlusIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* 右侧：用户菜单 */}
            <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={copyAccessLink}
                className="hidden md:flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 border border-gray-200 bg-white/60"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>复制链接</span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:bg-white/80 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 bg-white/60"
                >
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-medium text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium truncate max-w-20 sm:max-w-24">{user?.name}</span>
                  <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false)
                          copyAccessLink()
                        }}
                        className="sm:hidden block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        复制访问链接
                      </button>
                      <Link
                        to={`/project/${currentProject.id}/manage`}
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Cog6ToothIcon className="mr-2 h-4 w-4" />
                        管理标签页
                      </Link>
                      <Link
                        to="/admin/projects"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        项目管理
                      </Link>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false)
                            handleLogout()
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          退出登录
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 内容区域 */}
      <div className="h-[calc(100vh-4rem)] p-2 sm:p-4">
        {activeTab ? (
          <div className="h-full bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <iframe
              src={activeTab.url}
              className="w-full h-full border-0"
              title={activeTab.name}
              onLoad={() => console.log(`Loaded: ${activeTab.name}`)}
              onError={() => console.error(`Failed to load: ${activeTab.name}`)}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto">
              <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                欢迎使用 {currentProject.name}
              </h3>
              {currentTabs.length === 0 ? (
                <div>
                  <p className="text-gray-600 mb-6">暂无标签页，开始添加一些有用的链接，让团队成员快速访问相关资源。</p>
                  <Link
                    to={`/project/${currentProject.id}/manage`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-xl"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    添加第一个标签页
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-6">请从上方选择一个标签页开始浏览，或者添加新的链接。</p>
                  <div className="flex justify-center space-x-3">
                    <Link
                      to={`/project/${currentProject.id}/manage`}
                      className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                      管理标签页
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 点击外部关闭下拉菜单 */}
      {(showProjectDropdown || showUserDropdown || showTabDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProjectDropdown(false)
            setShowUserDropdown(false)
            setShowTabDropdown(false)
          }}
        />
      )}
    </div>
  )
}