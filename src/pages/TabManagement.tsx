import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { createTab, updateTab, deleteTab, updateTabsOrder } from '../lib/projects'
import { signOut } from '../lib/auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  ExternalLink, 
  ArrowLeft, 
  Loader2, 
  LogOut,
  Users,
  FileText,
  Globe,
  Link as LinkIcon
} from 'lucide-react'

export function TabManagement() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { projects, tabs, isLoading, fetchProjects, fetchTabs, addTab, updateTab: updateTabInStore, removeTab } = useProjectStore()
  const { user, logout } = useAuthStore()
  const { toast } = useToast()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTab, setEditingTab] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const project = projects.find(p => p.id === projectId)
  const currentTabs = tabs.filter(tab => tab.project_id === projectId).sort((a, b) => a.order_index - b.order_index)
  
  useEffect(() => {
    if (projectId) {
      fetchProjects()
      fetchTabs(projectId)
    }
  }, [projectId])
  
  const handleLogout = async () => {
    try {
      await signOut()
      logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  const handleCreateTab = async (data: { name: string; url: string }) => {
    if (!projectId) return
    
    setIsSubmitting(true)
    try {
      const tab = await createTab(projectId, data.name, data.url, currentTabs.length)
      addTab(tab)
      setShowCreateModal(false)
      toast({
        title: "创建成功",
        description: `标签页 "${data.name}" 已创建`,
      })
    } catch (error) {
      console.error('Error creating tab:', error)
      toast({
        title: "创建失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleUpdateTab = async (id: string, data: { name: string; url: string }) => {
    setIsSubmitting(true)
    try {
      const tab = await updateTab(id, data.name, data.url)
      updateTabInStore(tab)
      setEditingTab(null)
      toast({
        title: "更新成功",
        description: `标签页 "${data.name}" 已更新`,
      })
    } catch (error) {
      console.error('Error updating tab:', error)
      toast({
        title: "更新失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteTab = async (id: string, name: string) => {
    if (!confirm(`确定要删除标签页 "${name}" 吗？此操作不可撤销。`)) return
    
    try {
      await deleteTab(id)
      removeTab(id)
      toast({
        title: "删除成功",
        description: `标签页 "${name}" 已删除`,
      })
    } catch (error) {
      console.error('Error deleting tab:', error)
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }
  
  const handleDragEnd = async (result: any) => {
    if (!result.destination || !projectId) return
    
    const items = Array.from(currentTabs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    try {
      await updateTabsOrder(projectId, items.map((item, index) => ({ id: item.id, order_index: index })))
      // 更新本地状态
      items.forEach((item, index) => {
        updateTabInStore({ ...item, order_index: index })
      })
      toast({
        title: "排序已保存",
        description: "标签页顺序已更新",
        duration: 2000,
      })
    } catch (error) {
      console.error('Error updating tab order:', error)
      toast({
        title: "排序失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载标签页中...</p>
        </div>
      </div>
    )
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">项目未找到</CardTitle>
            <CardDescription className="mb-4">
              请检查项目ID是否正确
            </CardDescription>
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回项目列表
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 - 全宽设计 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span className="font-bold">{project.name}</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">标签页管理</span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <div className="container py-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between space-y-2 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">标签页管理</h1>
            <p className="text-muted-foreground">
              管理 {project.name} 的标签页，拖拽调整顺序
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加标签页
          </Button>
        </div>
        
        {currentTabs.length === 0 ? (
          /* 空状态 */
          <Card className="flex flex-col items-center justify-center py-16">
            <CardContent className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">还没有标签页</CardTitle>
              <CardDescription className="mb-4">
                为项目添加第一个标签页
              </CardDescription>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加标签页
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* 标签页列表 */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{currentTabs.length} 个标签页</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                拖拽标签页来调整顺序
              </p>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tabs">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg p-2' : ''
                    }`}
                  >
                    {currentTabs.map((tab, index) => (
                      <Draggable key={tab.id} draggableId={tab.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`transition-all ${
                              snapshot.isDragging 
                                ? 'shadow-lg rotate-1 scale-105' 
                                : 'hover:shadow-md'
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                {/* 拖拽手柄 */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="h-5 w-5" />
                                </div>
                                
                                {/* 序号 */}
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                                  {index + 1}
                                </div>
                                
                                {/* 标签页信息 */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">{tab.name}</h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <a
                                      href={tab.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-muted-foreground hover:text-foreground truncate transition-colors"
                                    >
                                      {tab.url}
                                    </a>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                </div>
                                
                                {/* 操作按钮 */}
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingTab(tab)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTab(tab.id, tab.name)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>
      
      {/* 创建/编辑标签页模态框 */}
      {(showCreateModal || editingTab) && (
        <TabModal
          tab={editingTab}
          isOpen={showCreateModal || !!editingTab}
          onClose={() => {
            setShowCreateModal(false)
            setEditingTab(null)
          }}
          onSubmit={editingTab ? 
            (data) => handleUpdateTab(editingTab.id, data) :
            handleCreateTab
          }
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

// 标签页创建/编辑模态框组件
function TabModal({ tab, isOpen, onClose, onSubmit, isSubmitting }: {
  tab?: any
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; url: string }) => void
  isSubmitting: boolean
}) {
  const [name, setName] = useState(tab?.name || '')
  const [url, setUrl] = useState(tab?.url || '')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return
    onSubmit({ 
      name: name.trim(), 
      url: url.trim()
    })
  }
  
  if (!isOpen) return null
  
  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {tab ? '编辑标签页' : '创建标签页'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tab ? '修改标签页信息' : '添加一个新的标签页'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              标签页名称 *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入标签页名称"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              标签页链接 *
            </label>
            <input
              id="url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !url.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                tab ? '更新标签页' : '创建标签页'
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}