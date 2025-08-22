import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  GripVertical,
  Link as LinkIcon,
  FileText,
  Loader2,
  FolderOpen,
  Save
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { useProjectStore } from '../store/projectStore'
import { createTab, updateTab, deleteTab, updateTabsOrder } from '../lib/projects'
import type { Tab } from '../lib/supabase'

const ItemType = 'TAB'

interface DragItem {
  id: string
  index: number
}

export function TabManagement() {
  const { id } = useParams<{ id: string }>()
  const { 
    currentProject, 
    currentTabs, 
    fetchProject, 
    fetchProjectTabs, 
    addTab, 
    updateTab: updateTabInStore, 
    removeTab,
    reorderTabs
  } = useProjectStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTab, setEditingTab] = useState<Tab | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    if (id) {
      fetchProject(id)
      fetchProjectTabs(id)
    }
  }, [id])
  
  const handleCreateTab = async (data: { name: string; url: string }) => {
    if (!id) return
    
    setIsSubmitting(true)
    try {
      const tab = await createTab(id, data.name, data.url)
      addTab(tab)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating tab:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleUpdateTab = async (tabId: string, data: { name: string; url: string }) => {
    setIsSubmitting(true)
    try {
      const tab = await updateTab(tabId, data)
      updateTabInStore(tab)
      setEditingTab(null)
    } catch (error) {
      console.error('Error updating tab:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteTab = async (tabId: string) => {
    if (!confirm('确定要删除这个标签页吗？')) return
    
    try {
      await deleteTab(tabId)
      removeTab(tabId)
    } catch (error) {
      console.error('Error deleting tab:', error)
    }
  }
  
  const moveTab = async (dragIndex: number, hoverIndex: number) => {
    const dragTab = currentTabs[dragIndex]
    const newTabs = [...currentTabs]
    newTabs.splice(dragIndex, 1)
    newTabs.splice(hoverIndex, 0, dragTab)
    
    // 更新本地状态
    reorderTabs(newTabs)
    
    // 更新服务器
    try {
      const updates = newTabs.map((tab, index) => ({
        id: tab.id,
        order_index: index + 1
      }))
      await updateTabsOrder(updates)
    } catch (error) {
      console.error('Error updating tab order:', error)
      // 如果失败，重新获取数据
      if (id) fetchProjectTabs(id)
    }
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
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        {/* 顶部导航 */}
        <nav className="bg-card border-b h-16 w-full">
          <div className="w-full px-6">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button asChild variant="outline">
                  <Link to={`/project/${currentProject.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回项目管理
                  </Link>
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <h1 className="text-foreground text-lg font-semibold">
                    标签页管理
                  </h1>
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加标签页
                </Button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* 主内容区域 */}
        <div className="flex-1 p-6 w-full">
          <div className="max-w-6xl mx-auto">
            {currentTabs.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 bg-muted rounded-2xl flex items-center justify-center mb-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">暂无标签页</h3>
                <p className="text-muted-foreground text-lg mb-8">开始创建您的第一个标签页</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  创建标签页
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">
                      {currentProject.name} - 标签页管理
                    </h2>
                    <p className="text-muted-foreground mt-2 text-lg">
                      管理项目中的标签页，支持拖拽排序
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg">
                  <div className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          <FolderOpen className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          拖拽标签页可以调整显示顺序，点击标签页名称可以进行重命名操作
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {currentTabs.map((tab, index) => (
                    <DraggableTabItem
                      key={tab.id}
                      tab={tab}
                      index={index}
                      moveTab={moveTab}
                      onEdit={() => setEditingTab(tab)}
                      onDelete={() => handleDeleteTab(tab.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
    </DndProvider>
  )
}

// 可拖拽的标签页项目组件
function DraggableTabItem({ tab, index, moveTab, onEdit, onDelete }: {
  tab: Tab
  index: number
  moveTab: (dragIndex: number, hoverIndex: number) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: tab.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })
  
  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: DragItem) => {
      if (item.index !== index) {
        moveTab(item.index, index)
        item.index = index
      }
    }
  })
  
  const dragDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        drag(drop(node))
      }
    },
    [drag, drop]
  )
  
  return (
    <Card
      ref={dragDropRef}
      className={`group cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground truncate">{tab.name}</h3>
                <Badge variant="secondary" className="h-2 w-2 p-0 bg-green-400" title="链接有效" />
              </div>
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground truncate">{tab.url}</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Button>
            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 标签页创建/编辑模态框组件
function TabModal({ tab, isOpen, onClose, onSubmit, isSubmitting }: {
  tab?: Tab | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; url: string }) => void
  isSubmitting: boolean
}) {
  const [name, setName] = useState(tab?.name || '')
  const [url, setUrl] = useState(tab?.url || '')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, url })
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {tab ? '编辑标签页' : '添加标签页'}
              </DialogTitle>
              <DialogDescription>
                {tab ? '修改标签页信息' : '为项目添加新的链接'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">标签页名称</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：项目文档、设计稿等"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">链接地址</Label>
            <Input
              id="url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                tab ? '更新标签页' : '添加标签页'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}