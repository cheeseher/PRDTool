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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="bg-gray-800 h-16">
        <div className="max-w-full mx-auto px-2 sm:px-4 h-full">
          <div className="flex items-center h-full">
            {/* 左侧：项目切换器 */}
            <div className="flex-shrink-0 w-32 sm:w-40 md:w-48">
              <div className="relative">
                <button
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="flex items-center px-2 sm:px-3 py-2 text-white hover:bg-gray-700 rounded-md transition-colors w-full"
                >
                  <span className="truncate text-sm sm:text-base" title={currentProject.name}>
                    {currentProject.name}
                  </span>
                  <ChevronDownIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
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
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
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
                
                {hiddenTabs.length > 0 && (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowTabDropdown(!showTabDropdown)}
                      className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors whitespace-nowrap"
                    >
                      更多
                      <ChevronDownIcon className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
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
                  className="flex-shrink-0 flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                >
                  <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
            
            {/* 右侧：用户菜单 */}
            <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={copyAccessLink}
                className="hidden sm:block text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
              >
                复制访问链接
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-1 sm:space-x-2 text-white hover:bg-gray-700 px-2 sm:px-3 py-2 rounded-md transition-colors"
                >
                  <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-xs sm:text-sm truncate max-w-20 sm:max-w-none">{user?.name}</span>
                  <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
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
      <div className="h-[calc(100vh-4rem)]">
        {activeTab ? (
          <iframe
            src={activeTab.url}
            className="w-full h-full border-0"
            title={activeTab.name}
            onLoad={() => console.log(`Loaded: ${activeTab.name}`)}
            onError={() => console.error(`Failed to load: ${activeTab.name}`)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                欢迎使用 {currentProject.name}
              </h3>
              {currentTabs.length === 0 ? (
                <div>
                  <p className="text-gray-600 mb-4">暂无标签页，开始添加一些链接吧</p>
                  <Link
                    to={`/project/${currentProject.id}/manage`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    添加标签页
                  </Link>
                </div>
              ) : (
                <p className="text-gray-600">请选择一个标签页开始浏览</p>
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