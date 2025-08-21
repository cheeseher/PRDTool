import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
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
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* 顶部导航 */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  to={`/project/${currentProject.id}`}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span className="font-medium">返回项目</span>
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {currentProject.name}
                  </h1>
                  <p className="text-sm text-gray-600">标签页管理</p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-xl"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  添加标签页
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* 主要内容 */}
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {currentTabs.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无标签页</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">为您的项目添加一些有用的链接，让团队成员快速访问相关资源。</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-xl"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  添加第一个标签页
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bars3Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">拖拽排序</p>
                      <p className="text-xs text-blue-700">您可以拖拽标签页来调整显示顺序</p>
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
  

  
  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 cursor-move transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <Bars3Icon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{tab.name}</h3>
              <div className="h-2 w-2 bg-green-400 rounded-full" title="链接有效"></div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className="text-sm text-gray-600 truncate">{tab.url}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="编辑标签页"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="删除标签页"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
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
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {tab ? '编辑标签页' : '添加标签页'}
              </h3>
              <p className="text-sm text-gray-600">
                {tab ? '修改标签页信息' : '为项目添加新的链接'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标签页名称</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="例如：项目文档、设计稿等"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">链接地址</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="https://example.com"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </>
                ) : (
                  tab ? '更新标签页' : '添加标签页'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}