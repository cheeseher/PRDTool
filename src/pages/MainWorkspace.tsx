import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { signOut } from '../lib/auth'
import type { Tab } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  ChevronDown, 
  Settings, 
  Plus, 
  Link as LinkIcon, 
  FolderOpen, 
  LogOut, 
  Loader2,
  MoreHorizontal,
  Check 
} from 'lucide-react'

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
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab | null>(null)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showTabDropdown, setShowTabDropdown] = useState(false)
  const [visibleTabs, setVisibleTabs] = useState<Tab[]>([])
  const tabDropdownRef = useRef<HTMLDivElement>(null)
  const projectDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const [hiddenTabs, setHiddenTabs] = useState<Tab[]>([])
  const [isCopied, setIsCopied] = useState(false)
  
  useEffect(() => {
    fetchProjects()
    if (id) {
      fetchProject(id)
      fetchProjectTabs(id)
    }
  }, [id])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target as Node)) {
        setShowTabDropdown(false)
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    if (showTabDropdown || showProjectDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTabDropdown, showProjectDropdown, showUserDropdown])
  
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
  
  const copyAccessLink = async () => {
    if (currentProject) {
      try {
        const link = `${window.location.origin}/access/${currentProject.token}`
        await navigator.clipboard.writeText(link)
        
        // 设置复制状态
        setIsCopied(true)
        
        // 显示成功Toast
        toast({
          title: "复制成功",
          description: "访问链接已复制到剪贴板",
          duration: 2000,
        })
        
        // 2秒后移除成功状态
        setTimeout(() => {
          setIsCopied(false)
        }, 2000)
      } catch (error) {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板，请手动复制",
          variant: "destructive",
        })
      }
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="relative mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">加载中</h3>
          <p className="text-muted-foreground">正在为您准备工作空间...</p>
        </div>
      </div>
    )
  }
  
  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">项目不存在</h1>
          <Button asChild variant="link">
            <Link to="/admin/projects">
              返回项目列表
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <nav className="bg-card border-b h-16 sticky top-0 z-50 w-full">
        <div className="w-full px-6">
          <div className="flex items-center h-16">
            {/* 左侧：项目切换器 */}
            <div className="flex-shrink-0 w-64">
              <div ref={projectDropdownRef} className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="flex items-center space-x-2 w-full justify-between"
                  size="sm"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {currentProject.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{currentProject.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Button>
                
                {showProjectDropdown && (
                  <Card className="absolute top-full left-0 mt-2 w-80 shadow-lg z-50">
                    <CardContent className="p-1">
                      {projects.map((project) => (
                        <Button
                          key={project.id}
                          asChild
                          variant={project.id === currentProject.id ? "secondary" : "ghost"}
                          className="w-full justify-start h-auto p-3 mb-1"
                          onClick={() => setShowProjectDropdown(false)}
                        >
                          <Link to={`/project/${project.id}`}>
                            <div className="text-left">
                              <div className="font-medium">{project.name}</div>
                              {project.description && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {project.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        </Button>
                      ))}
                      <Separator className="my-1" />
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setShowProjectDropdown(false)}
                      >
                        <Link to="/admin/projects">
                          管理所有项目
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            {/* 中间：标签页 */}
            <div className="flex-1 flex items-center justify-center px-6 overflow-hidden">
              <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
                {visibleTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    variant={activeTab?.id === tab.id ? "default" : "outline"}
                    size="sm"
                    className="flex-shrink-0 whitespace-nowrap"
                  >
                    <span className="truncate max-w-32">{tab.name}</span>
                  </Button>
                ))}
                
                {hiddenTabs.length > 0 && (
                  <div ref={tabDropdownRef} className="relative flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTabDropdown(!showTabDropdown)}
                      className="flex items-center whitespace-nowrap"
                    >
                      更多
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                    
                    {showTabDropdown && (
                      <Card className="absolute top-full right-0 mt-1 w-56 shadow-lg z-50">
                        <CardContent className="p-1">
                          {hiddenTabs.map((tab) => (
                            <Button
                              key={tab.id}
                              variant={activeTab?.id === tab.id ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => handleTabClick(tab)}
                              className="w-full justify-start text-sm"
                            >
                              {tab.name}
                            </Button>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
                
                {/* 添加标签页按钮 */}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Link to={`/project/${currentProject.id}/manage`} title="管理标签页">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* 右侧：用户菜单 */}
            <div className="flex-shrink-0 flex items-center space-x-3">
              <Button
                variant={isCopied ? "default" : "outline"}
                size="sm"
                onClick={copyAccessLink}
                disabled={isCopied}
              >
                {isCopied ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    已复制
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    复制链接
                  </>
                )}
              </Button>
              
              <div ref={userDropdownRef} className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate max-w-32">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
                
                {showUserDropdown && (
                  <Card className="absolute top-full right-0 mt-2 w-56 shadow-lg z-50">
                    <CardContent className="p-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <Link to={`/project/${currentProject.id}/manage`}>
                          <Settings className="mr-2 h-4 w-4" />
                          管理标签页
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <Link to="/admin/projects">
                          <FolderOpen className="mr-2 h-4 w-4" />
                          项目管理
                        </Link>
                      </Button>
                      <Separator className="my-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowUserDropdown(false)
                          handleLogout()
                        }}
                        className="w-full justify-start"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        退出登录
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 内容区域 */}
      <div className="h-[calc(100vh-3.5rem)]">
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
            <div className="text-center max-w-lg mx-auto">
              <div className="mx-auto h-24 w-24 bg-primary rounded-2xl flex items-center justify-center mb-8">
                <FolderOpen className="h-12 w-12 text-primary-foreground" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                欢迎使用 {currentProject.name}
              </h3>
              {currentTabs.length === 0 ? (
                <div>
                  <p className="text-muted-foreground mb-6">暂无标签页，开始添加一些有用的链接，让团队成员快速访问相关资源。</p>
                  <Button
                    asChild
                    size="lg"
                  >
                    <Link to={`/project/${currentProject.id}/manage`}>
                      <Plus className="mr-2 h-5 w-5" />
                      添加第一个标签页
                    </Link>
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-6">请从上方选择一个标签页开始浏览，或者添加新的链接。</p>
                  <div className="flex justify-center space-x-3">
                    <Button
                      asChild
                      variant="outline"
                    >
                      <Link to={`/project/${currentProject.id}/manage`}>
                        <Plus className="mr-2 h-4 w-4" />
                        管理标签页
                      </Link>
                    </Button>
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