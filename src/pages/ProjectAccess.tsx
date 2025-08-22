import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, AlertTriangle, Lock, Loader2, FolderOpen, RotateCcw, ExternalLink } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
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
  const dropdownRef = useRef<HTMLDivElement>(null)
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

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])
  
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
        <Loader2 className="h-32 w-32 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">访问失败</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }
  
  if (isPasswordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-lg w-full space-y-10 p-8">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-primary rounded-2xl flex items-center justify-center mb-8">
              <Lock className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-bold text-primary mb-3">{project?.name}</h2>
            <p className="text-muted-foreground text-lg">此项目需要密码访问</p>
          </div>
          
          <Card>
            <CardContent className="p-10">
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-5 py-4 rounded-xl">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password">访问密码</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg h-12"
                    placeholder="请输入访问密码"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isVerifying}
                  size="lg"
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      验证中...
                    </>
                  ) : (
                    '访问项目'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* 开发者致谢 */}
          <div className="text-center">
            <Badge variant="secondary" className="text-sm px-6 py-3">
              💝 感谢您参与Shane的本个项目，开发不易，携手同行！
            </Badge>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="bg-card border-b h-16 w-full">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-full">
            {/* 项目名称 */}
            <div className="flex items-center space-x-4 min-w-0 flex-shrink-0 w-64">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm font-medium">
                  {project?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-foreground text-lg font-semibold truncate" title={project?.name}>
                {project?.name}
              </h1>
            </div>
            
            {/* 标签页区域 */}
            <div className="flex-1 flex items-center justify-center px-6 overflow-hidden">
              <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide max-w-full">
                {/* 可见标签页 */}
                {visibleTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    variant={activeTab?.id === tab.id ? "default" : "outline"}
                    size="sm"
                    className="flex-shrink-0 whitespace-nowrap transition-all duration-300 h-9"
                  >
                    {tab.name}
                  </Button>
                ))}
                
                {/* 下拉菜单按钮 */}
                {hiddenTabs.length > 0 && (
                  <div ref={dropdownRef} className="relative flex-shrink-0">
                    <Button
                      onClick={() => setShowDropdown(!showDropdown)}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap h-9"
                    >
                      更多
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                    
                    {showDropdown && (
                      <Card className="absolute top-full right-0 mt-2 w-56 shadow-lg z-50">
                        <CardContent className="p-1">
                          {hiddenTabs.map((tab) => (
                            <Button
                              key={tab.id}
                              onClick={() => {
                                handleTabClick(tab)
                                setShowDropdown(false)
                              }}
                              variant={activeTab?.id === tab.id ? "secondary" : "ghost"}
                              size="sm"
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
              </div>
            </div>
            
            {/* 右侧占位 */}
            <div className="flex-shrink-0 w-64"></div>
          </div>
        </div>
      </nav>
      
      {/* 内容区域 */}
      <div className="h-[calc(100vh-4rem)] w-full">
        {activeTab ? (
          <div className="w-full h-full relative overflow-hidden">
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">正在加载 {activeTab.name}...</p>
                </div>
              </div>
            )}
            
            {iframeError ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center max-w-md mx-auto p-6">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">页面加载失败</h3>
                  <p className="text-sm text-muted-foreground mb-4">{iframeError}</p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        setIframeError('')
                        setIframeLoading(true)
                        // 强制重新加载iframe
                        const iframe = document.querySelector('iframe')
                        if (iframe) {
                          iframe.src = iframe.src
                        }
                      }}
                      className="w-full"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      重新加载
                    </Button>
                    <Button
                      onClick={() => openInNewTab(activeTab.url)}
                      variant="secondary"
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      在新标签页中打开
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
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
            <div className="text-center max-w-lg mx-auto">
              <div className="mx-auto h-24 w-24 bg-primary rounded-2xl flex items-center justify-center mb-8">
                <FolderOpen className="h-12 w-12 text-primary-foreground" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">欢迎访问 {project?.name}</h3>
              {tabs.length === 0 ? (
                <p className="text-muted-foreground text-lg">暂无可用的标签页</p>
              ) : (
                <p className="text-muted-foreground text-lg">请选择一个标签页开始浏览</p>
              )}
            </div>
          </div>
        )}
      </div>
      

    </div>
  )
}