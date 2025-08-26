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
  Check,
  Eye,
  Users
} from 'lucide-react'
import { useState, useEffect } from 'react'

export function MainWorkspace() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, currentTabs, isLoading, fetchProjects, fetchProjectTabs } = useProjectStore()
  const { user, logout } = useAuthStore()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState<string>('')
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  
  const project = projects.find(p => p.id === projectId)
  const projectTabs = (currentTabs || []).filter(tab => tab.project_id === projectId).sort((a, b) => a.order_index - b.order_index)
  
  // 计算可见和隐藏的标签页
  const maxVisible = 4
  const visibleTabs = projectTabs.slice(0, maxVisible)
  const hiddenTabs = projectTabs.slice(maxVisible)
  
  useEffect(() => {
    if (projectId) {
      fetchProjects()
      fetchProjectTabs(projectId)
    }
  }, [projectId])
  
  useEffect(() => {
    if (projectTabs.length > 0 && !activeTab) {
      setActiveTab(projectTabs[0].id)
    }
  }, [projectTabs, activeTab])
  
  const handleLogout = async () => {
    try {
      await signOut()
      logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    setShowMoreDropdown(false)
  }
  
  const copyProjectLink = async () => {
    if (!project) return
    
    try {
      setCopiedToken(true)
      const link = `${window.location.origin}/access/${project.token}`
      await navigator.clipboard.writeText(link)
      
      toast({
        title: "复制成功",
        description: "项目访问链接已复制到剪贴板",
        duration: 2000,
      })
      
      setTimeout(() => setCopiedToken(false), 500)
    } catch (error) {
      setCopiedToken(false)
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板，请手动复制",
        variant: "destructive",
      })
    }
  }
  
  const activeTabData = currentTabs.find(tab => tab.id === activeTab)
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载项目中...</p>
        </div>
      </div>
    )
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">项目未找到</h3>
            <p className="text-muted-foreground mb-4">请检查项目ID是否正确</p>
            <Button asChild>
              <Link to="/projects">返回项目列表</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 - 使用 shadcn/ui 官方样式 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* 左侧：项目信息和标签页 */}
          <div className="mr-4 flex items-center space-x-4">
            {/* 项目下拉菜单 */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="flex items-center space-x-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {project.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{project.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {showProjectDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProjectDropdown(false)} 
                  />
                  <Card className="absolute top-full left-0 mt-2 w-80 z-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyProjectLink}
                            disabled={copiedToken}
                            className="w-full justify-start"
                          >
                            {copiedToken ? (
                              <Check className="h-4 w-4 mr-2" />
                            ) : (
                              <LinkIcon className="h-4 w-4 mr-2" />
                            )}
                            {copiedToken ? '已复制' : '复制访问链接'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="w-full justify-start"
                          >
                            <Link to={`/project/${project.id}/tabs`}>
                              <Settings className="h-4 w-4 mr-2" />
                              管理标签页
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="w-full justify-start"
                          >
                            <Link to="/projects">
                              <Eye className="h-4 w-4 mr-2" />
                              所有项目
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            
            <Separator orientation="vertical" className="h-4" />
            
            {/* 标签页导航 */}
            <div className="flex items-center space-x-1">
              {visibleTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTabClick(tab.id)}
                  className="text-sm"
                >
                  {tab.name}
                </Button>
              ))}
              
              {/* 更多标签页按钮 */}
              {hiddenTabs.length > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                    className="flex items-center space-x-1"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span>更多 ({hiddenTabs.length})</span>
                  </Button>
                  
                  {showMoreDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowMoreDropdown(false)} 
                      />
                      <Card className="absolute top-full right-0 mt-2 w-56 z-50">
                        <CardContent className="p-2">
                          <div className="space-y-1">
                            {hiddenTabs.map((tab) => (
                              <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleTabClick(tab.id)}
                                className="w-full justify-start text-sm"
                              >
                                {tab.name}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              )}
              
              {/* 添加标签页按钮 */}
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link to={`/project/${project.id}/tabs`}>
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* 右侧：用户菜单 */}
          <div className="ml-auto">
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserDropdown(false)} 
                  />
                  <Card className="absolute top-full right-0 mt-2 w-56 z-50">
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <Separator />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLogout}
                          className="w-full justify-start text-sm"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          退出登录
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <main className="flex-1">
        {projectTabs.length === 0 ? (
          /* 空状态 */
          <div className="container py-16">
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center py-8">
                <Plus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">还没有标签页</h3>
                <p className="text-muted-foreground mb-4">
                  为项目添加第一个标签页开始工作
                </p>
                <Button asChild>
                  <Link to={`/project/${project.id}/tabs`}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加标签页
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : activeTabData ? (
          /* 标签页内容 */
          <div className="h-[calc(100vh-3.5rem)]">
            <iframe
              src={activeTabData.url}
              className="w-full h-full border-0"
              title={activeTabData.name}
            />
          </div>
        ) : (
          /* 欢迎页面 */
          <div className="container py-16">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="text-center py-12">
                <div className="mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarFallback className="text-2xl">
                      {project.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-3xl font-bold mb-2">欢迎来到 {project.name}</h1>
                  {project.description && (
                    <p className="text-lg text-muted-foreground mb-6">
                      {project.description}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Settings className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">管理标签页</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        添加、编辑和排序项目标签页
                      </p>
                      <Button asChild size="sm">
                        <Link to={`/project/${project.id}/tabs`}>
                          管理标签页
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <LinkIcon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">分享项目</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        复制访问链接分享给团队成员
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={copyProjectLink}
                        disabled={copiedToken}
                      >
                        {copiedToken ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            已复制
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            复制链接
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                {currentTabs.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">项目标签页</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentTabs.map((tab) => (
                        <Button
                          key={tab.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleTabClick(tab.id)}
                        >
                          {tab.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}