import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { signOut } from '../lib/auth'
import type { Tab } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  ChevronDown, 
  Settings, 
  Plus, 
  Link as LinkIcon, 
  FolderOpen, 
  LogOut,
  Check,
  Eye,
  MoreHorizontal
} from 'lucide-react'

interface TopNavigationProps {
  activeTab: Tab | null
  onTabClick: (tab: Tab) => void
}

export function TopNavigation({ activeTab, onTabClick }: TopNavigationProps) {
  const { 
    projects, 
    currentProject, 
    currentTabs
  } = useProjectStore()
  const { user, logout } = useAuthStore()
  const { toast } = useToast()
  
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  
  const projectDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const moreDropdownRef = useRef<HTMLDivElement>(null)
  
  // 计算可见和隐藏的标签页
  const maxVisibleTabs = 4
  const visibleTabs = currentTabs.slice(0, maxVisibleTabs)
  const hiddenTabs = currentTabs.slice(maxVisibleTabs)
  
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setShowMoreDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleLogout = async () => {
    try {
      await signOut()
      logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  const copyAccessLink = async () => {
    if (currentProject) {
      try {
        setIsCopied(true)
        const link = `${window.location.origin}/access/${currentProject.token}`
        await navigator.clipboard.writeText(link)
        
        toast({
          title: "复制成功",
          description: "访问链接已复制到剪贴板",
          duration: 2000,
        })
        
        setTimeout(() => {
          setIsCopied(false)
        }, 500)
      } catch (error) {
        setIsCopied(false)
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板，请手动复制",
          variant: "destructive",
        })
      }
    }
  }
  
  if (!currentProject) return null
  
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 sticky top-0 z-30 w-full shadow-sm">
      <div className="flex items-center h-16 px-6">
        {/* 左侧：项目切换器 */}
        <div className="flex-shrink-0 w-64">
          <div ref={projectDropdownRef} className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center space-x-2 w-full justify-between px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-blue-500 text-white">
                    {currentProject.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium truncate">{currentProject.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
            </button>
            
            {showProjectDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                <div className="p-2">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/project/${project.id}`}
                      onClick={() => setShowProjectDropdown(false)}
                      className={`block w-full text-left p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        project.id === currentProject.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="font-medium">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {project.description}
                        </div>
                      )}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <Link
                      to="/admin/projects"
                      onClick={() => setShowProjectDropdown(false)}
                      className="block w-full text-left p-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="flex items-center space-x-2">
            {/* 调试信息 */}
            <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              可见:{visibleTabs.length} 隐藏:{hiddenTabs.length} 总数:{currentTabs.length}
            </div>
            
            {/* 可见标签页 */}
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab?.id === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="truncate max-w-32">{tab.name}</span>
              </button>
            ))}
            
            {/* 更多按钮 */}
            {hiddenTabs.length > 0 && (
              <div ref={moreDropdownRef} className="relative">
                <button
                  onClick={() => {
                    console.log('点击更多按钮，当前状态:', showMoreDropdown)
                    setShowMoreDropdown(!showMoreDropdown)
                  }}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>更多 ({hiddenTabs.length})</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showMoreDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* 更多下拉菜单 - 使用Portal确保显示 */}
                {showMoreDropdown && (
                  <>
                    {/* 遮罩层 */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMoreDropdown(false)}
                    />
                    {/* 下拉菜单 */}
                    <div 
                      className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        marginTop: '8px',
                        zIndex: 9999
                      }}
                    >
                      <div className="p-2">
                        <div className="text-xs text-gray-500 px-2 py-1 mb-2">
                          隐藏的标签页
                        </div>
                        {hiddenTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => {
                              console.log('从更多菜单点击标签页:', tab)
                              onTabClick(tab)
                              setShowMoreDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                              activeTab?.id === tab.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <span className="truncate block">{tab.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* 添加标签页按钮 */}
            <Link
              to={`/project/${currentProject.id}/manage`}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="管理标签页"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {/* 右侧：用户菜单 */}
        <div className="flex-shrink-0 flex items-center space-x-3">
          <button
            onClick={copyAccessLink}
            disabled={isCopied}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isCopied
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                <span>已复制</span>
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                <span>分享链接</span>
              </>
            )}
          </button>
          
          <div ref={userDropdownRef} className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gray-500 text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate max-w-32">{user?.name}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                <div className="p-2">
                  <Link
                    to={`/project/${currentProject.id}/manage`}
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>管理标签页</span>
                  </Link>
                  <Link
                    to="/admin/projects"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>项目管理</span>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  <button
                    onClick={() => {
                      setShowUserDropdown(false)
                      handleLogout()
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}